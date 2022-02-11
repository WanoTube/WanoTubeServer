const fs = require('fs')
const path = require('path');
const mongoose = require('mongoose');
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')
const {
	compressVideo,
	videoConvertToAudio,
	restrictVideoName,
	isVideoHaveAudioTrack,
	convertToWebmFormat
} = require('../utils/videos-handlers')

const { audioRecognition, musicIncluded } = require('./audio-recoginition.controller')
const { createVideoInfos } = require('./video-info.controller')

const { Video } = require('../models/video');
const httpStatus = require('../utils/http-status')


exports.getVideoById = async function (req, res) {
	const key = req.params.key;
	try {
		const readStream = await getFileStream(key)
		if (readStream) {
			readStream.pipe(res);
		}
	} catch (error) {
		res.json(error);
	}
};

exports.uploadVideo = async function (req, res) {
	let file = req.files;
	const body = req.body

	if (req.files) {
		file = file.video
	} else {
		res.status(400).json("No file")
		return
	}
	if (body && file) {
		try {
			const analizedVideo = await videoAnalysis(file, res.app, body);
			await uploadToS3(analizedVideo, req.app);
			const recognizedMusic = await audioRecognitionFromVideo(analizedVideo);
			const saveDBResult = await saveVideoToDatabase(analizedVideo, body, recognizedMusic)
			if (saveDBResult) res.status(200).json(saveDBResult)
			else res.status(400).json("Cannot save DB");
			await removeRedundantFiles('./videos');
			await removeRedundantFiles('./audios');
		} catch (error) {
			console.log("error: ", error)
			if (error.message) res.status(400).json(error.message)
			else res.status(400).json(error)
		}

	} else {
		res.status(400).json("No body")
	}
}

async function removeRedundantFiles(directory) {
	const files = await fs.promises.readdir(directory)
	if (files.length) {
		const promises = files.map(e => fs.promises.unlink(path.join(directory, e)));
		await Promise.all(promises)
	}
}

function uploadToS3(newFilePath, app) {
	const io = app.get('socketio');

	return new Promise(function (resolve, reject) {
		try {
			// reqVideo is redundant
			const reqVideo = {
				url: "test-url",
				videoFile: newFilePath
			}
			if (newFilePath) {
				// Save to AWS
				const { base } = path.parse(newFilePath);
				const fileName = base;
				const newFileBuffer = fs.readFileSync(newFilePath);
				const fileStream = Buffer.from(newFileBuffer, 'binary');
				uploadFile(fileName, fileStream)
					.on('httpUploadProgress', function (progress) {
						const progressPercentage = Math.round(progress.loaded / progress.total * 100);
						io.emit('Upload to S3', progressPercentage);
					});
				resolve(reqVideo);
			}
		} catch (error) {
			reject(error)
		}
	});
}

async function saveVideoToDatabase(newFilePath, body, recognizedMusics) {
	return new Promise(async function (resolve, reject) {
		try {
			if (recognizedMusics) {
				console.log("recognizedMusics: ", recognizedMusics);
				recognizedMusics = recognizedMusics.recognizeResult;
				if (recognizedMusics)
					musicIncluded(recognizedMusics)
			}
			const fileSize = fs.statSync(newFilePath).size;
			const { base } = path.parse(newFilePath);
			const reqVideo = {
				title: body.title,
				size: fileSize,
				description: body.description,
				duration: body.duration,
				url: base,
				recognition_result: recognizedMusics,
				visibility: body.privacy
			}

			if (newFilePath) {
				// Save to AWS
				const newVideo = new Video(reqVideo);

				// TO-DO: UserID is hardcoded
				const author_id = body.author_id;
				if (author_id) {
					newVideo.author_id = author_id

					console.log("Begin to create video in DB")
					const videoAfterCreatedInDB = await createVideoInfos(newVideo);
					if (videoAfterCreatedInDB) {
						console.log("videoAfterCreatedInDB: " + videoAfterCreatedInDB)
						resolve(videoAfterCreatedInDB)
					}
					else reject("Cannot save video to DB")
				}
				else
					reject("No user id passed")
			} else {
				reject("newFilePath not found")
			}
		} catch (error) {
			reject(error)
		}
	})

}

async function audioRecognitionFromVideo(newVideoSavedPath) {
	return new Promise(async function (resolve, reject) {
		try {
			const { name } = path.parse(newVideoSavedPath);
			console.log("NAME: " + name);
			const audioSavedPath = './audios/' + name + '.mp3';

			if (newVideoSavedPath) {
				const isAudioIncluded = await isVideoHaveAudioTrack(newVideoSavedPath);
				if (isAudioIncluded == true) {
					console.log("Converting to " + audioSavedPath);
					const convertResult = await videoConvertToAudio(newVideoSavedPath, audioSavedPath)
					if (convertResult) {
						console.log("Converted music")
					} else {
						throw new Error("Cannot convert music")
					}
					const bitmap = fs.readFileSync(audioSavedPath);

					//TO-DO: Split to multiple audios for recognize quicker and easier to track the song name from timestamp?

					console.log("Audio recogniting...");
					const recognizeResultACR = await audioRecognition(Buffer.from(bitmap));
					const recognizeResult = {
						savedName: newVideoSavedPath,
						recognizeResult: recognizeResultACR
					};
					if (recognizeResult && recognizeResultACR) {
						console.log("Recognized")
						resolve(recognizeResult)
					} else {
						console.log("Cannot recognize result")
						resolve(null)
					}
				} else {
					console.log("Video does not contain audio");
					resolve(null)
				}
			} else {
				throw new Error("file required");
			}
		} catch (error) {
			reject(error)
		}
	})

}

async function videoAnalysis(file, app, body) {
	const dataBuffers = file.data;
	const fileName = file.name;
	const { ext } = path.parse(fileName);
	const name = restrictVideoName(fileName, body.author_id);
	console.log("New name: ", name);

	const videoSavedPath = './videos/' + fileName;
	const newVideoSavedPath = './videos/' + name + ext;
	const newVideoSavedPathWebm = './videos/' + name + '.webm';

	return new Promise(async function (resolve, reject) {
		try {
			// Because if webm we will not compress video. But if we compress video, we need to have 2 paths
			let willSavePath = (ext == ".webm") ? newVideoSavedPath : videoSavedPath;
			console.log("willSavePath: ", willSavePath);
			fs.writeFileSync(willSavePath, dataBuffers)
			console.log("Saved " + willSavePath);
			if (ext.localeCompare(".webm") != 0) {
				await compressVideo(videoSavedPath, newVideoSavedPath, app);
				await convertToWebmFormat(newVideoSavedPath, newVideoSavedPathWebm, app);
				willSavePath = newVideoSavedPathWebm;
				console.log("Compressed video");
			}
			resolve(willSavePath);
		} catch (error) {
			reject(error);
		}
	})
}