const fs = require('fs');
const path = require('path');

const { trackProgress } = require('../configs/socket');
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers');
const {
	converVideoToAudio,
	isVideoHaveAudioTrack,
	generateThumbnail,
	generateVideoFile
} = require('../utils/videos-handlers');

const { recogniteAudio } = require('./audio-recoginition.controller');
const { createVideoInfos } = require('./video-info.controller');
const { Video } = require('../models/video');

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
	const { body, user } = req;
	body.author_id = user._id
	if (req.files) {
		file = file.video;
	} else {
		console.log('No file');
		res.status(400).json("No file");
		return;
	}
	if (body && file) {
		try {
			const { title, videoPath: videoKey } = await generateVideoFile(file, body);

			const recognizedMusic = await recogniteAudioFromVideo(videoKey);
			const thumbnailKey = await generateThumbnail(videoKey);
			await uploadToS3(thumbnailKey, (val) => val / 4 + 50);

			await uploadToS3(videoKey, (val => val / 4 + 75));

			const saveDBResult = await saveVideoToDatabase(videoKey, { ...body, title, recognition_result: recognizedMusic?.recognizeResult, thumbnail_key: thumbnailKey })
			if (saveDBResult) res.status(200).json(saveDBResult)
			else {
				console.log('Cannot save DB');
				res.status(500).json("Cannot save DB");
			}
			await removeRedundantFiles('uploads/videos');
			await removeRedundantFiles('uploads/audios');
			await removeRedundantFiles('uploads/thumbnails');
		} catch (error) {
			console.log(error)
			if (error.msg) return res.status(400).json(error.msg);
			else return res.status(400).json(error);
		}

	} else {
		console.log('No body')
		res.status(400).json("No body")
	}
}

async function removeRedundantFiles(directory) {
	const files = await fs.promises.readdir(directory)
	if (files.length) {
		const promises = files.map(file => {
			if (file.split(".")[0] !== "temp")
				fs.promises.unlink(path.join(directory, file));
		});
		await Promise.all(promises)
	}
}

function uploadToS3(newFilePath, customPercentageFn = val => val) {
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
				uploadFile(fileName, fileStream, () => resolve(reqVideo), (err) => reject(err))
					.on('httpUploadProgress', function (progress) {
						const progressPercentage = Math.round(progress.loaded / progress.total * 100);
						trackProgress(customPercentageFn(progressPercentage), 'Upload to S3');
					})
			}
		} catch (error) {
			reject(error)
		}
	});
}

async function saveVideoToDatabase(videoPath, body) {
	return new Promise(async function (resolve, reject) {
		try {
			const fileSize = fs.statSync(videoPath).size;
			const { title, description, duration, author_id, recognition_result, thumbnail_key, type } = body;
			const reqVideo = {
				title: title,
				size: fileSize,
				description: description,
				duration: duration,
				url: videoPath,
				visibility: 1,	//first set private
				recognition_result: recognition_result.status.code === 0 ? recognition_result : null,
				thumbnail_key,
				type: type
			}

			if (videoPath) {
				// Save to AWS
				const newVideo = new Video(reqVideo);

				// TO-DO: UserID is hardcoded
				if (author_id) {
					newVideo.author_id = author_id

					const videoAfterCreatedInDB = await createVideoInfos(newVideo);
					if (videoAfterCreatedInDB) {
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

async function recogniteAudioFromVideo(videoPath) {
	return new Promise(async function (resolve, reject) {
		try {
			const name = videoPath.split("/")[2].split(".")[0];
			const audioSavedPath = 'uploads/audios/' + name + '.mp3';
			if (videoPath) {
				const isAudioIncluded = await isVideoHaveAudioTrack(videoPath);
				trackProgress(10, 'Upload to S3');
				if (isAudioIncluded) {
					const convertResult = await converVideoToAudio(videoPath, audioSavedPath);
					trackProgress(18, 'Upload to S3');
					if (convertResult) {
					} else {
						throw new Error("Cannot convert music");
					}
					const bitmap = fs.readFileSync(audioSavedPath);

					//TO-DO: Split to multiple audios for recognize quicker and easier to track the song name from timestamp?

					const recognizeResultACR = await recogniteAudio(Buffer.from(bitmap));
					trackProgress(20, 'Upload to S3');
					const recognizeResult = {
						savedName: videoPath,
						recognizeResult: recognizeResultACR
					};
					if (recognizeResult && recognizeResultACR) {
						resolve(recognizeResult)
					} else {
						resolve("Cannot recognize result")
					}
				} else {
					console.log('null nef me')
					resolve(null)
				}
				trackProgress(25, 'Upload to S3');
			} else {
				throw new Error("file required");
			}
		} catch (error) {
			reject(error)
		}
	})

}

