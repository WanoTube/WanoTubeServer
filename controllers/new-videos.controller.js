const fs = require('fs')
const path = require('path');
const { trackProgress } = require('../configs/socket')
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')

const {
	compressVideo,
	converVideoToAudio,
	restrictVideoName,
	isVideoHaveAudioTrack,
	convertToWebmFormat
} = require('../utils/videos-handlers')

const { recogniteAudio, checkIfIncludingMusic } = require('./audio-recoginition.controller')
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
			const analizedVideo = await analyzeVideo(file, res.app, body);
			await uploadToS3(analizedVideo, req.app);

			console.log('uploadToS3')
			const recognizedMusic = await recogniteAudioFromVideo(analizedVideo);
			console.log(analizedVideo, recognizedMusic)
			console.log('analyzed')
			const saveDBResult = await saveVideoToDatabase(analizedVideo, body, recognizedMusic)
			console.log('save to db')
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
						trackProgress(progressPercentage, 'Upload to S3')
					});
				resolve(reqVideo);
			}
		} catch (error) {
			reject(error)
		}
	});
}

async function saveVideoToDatabase(newFilePath, body, recognizedMusics) {
	console.log('saving video ...')
	console.log({ newFilePath, body, recognizedMusics })
	return new Promise(async function (resolve, reject) {
		try {
			let recognizedResult;
			if (recognizedMusics) {
				console.log("recognizedMusics: ", recognizedMusics);
				recognizedMusics = recognizedMusics.recognizeResult;
				if (recognizedMusics) {
					recognizedResult = checkIfIncludingMusic(recognizedMusics);
				}
			}
			const fileSize = fs.statSync(newFilePath).size;
			const { base } = path.parse(newFilePath);
			const fileTitle = newFilePath.split('/')[2].split('.')[0]
			const reqVideo = {
				title: fileTitle,
				size: fileSize,
				description: body.description,
				duration: body.duration,
				url: base,
				recognition_result: recognizedResult,
				visibility: 1	//first set private
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

async function recogniteAudioFromVideo(newVideoSavedPath) {
	console.log('hello')
	return new Promise(async function (resolve, reject) {
		try {

			const { name } = path.parse(newVideoSavedPath);
			const audioSavedPath = './audios/' + name + '.mp3';

			if (newVideoSavedPath) {
				const isAudioIncluded = await isVideoHaveAudioTrack(newVideoSavedPath);
				console.log({ isAudioIncluded })
				if (isAudioIncluded) {
					console.log('isAudioIncluded===================================')
					const convertResult = await converVideoToAudio(newVideoSavedPath, audioSavedPath)
					console.log({ convertResult })
					if (convertResult) {
					} else {
						throw new Error("Cannot convert music")
					}
					const bitmap = fs.readFileSync(audioSavedPath);

					//TO-DO: Split to multiple audios for recognize quicker and easier to track the song name from timestamp?

					const recognizeResultACR = await recogniteAudio(Buffer.from(bitmap));
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

async function analyzeVideo(file, app, body) {
	console.log("Analyze")

	const dataBuffers = file.data;
	const fileName = file.name;
	const { ext } = path.parse(fileName);
	const name = restrictVideoName(fileName, body.author_id);

	const videoSavedPath = './videos/' + fileName;
	const newVideoSavedPath = './videos/' + name + ext;
	const newVideoSavedPathWebm = './videos/' + name + '.webm';

	return new Promise(async function (resolve, reject) {
		try {
			// Because if webm we will not compress video. But if we compress video, we need to have 2 paths
			let willSavePath = (ext == ".webm") ? newVideoSavedPath : videoSavedPath;
			fs.writeFileSync(willSavePath, dataBuffers)
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