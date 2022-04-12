const fs = require('fs')
const mongoose = require('mongoose');

const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')
const { compressVideo, converVideoToAudio, restrictVideoName } = require('../utils/videos-handlers')
const { recogniteAudio, checkIfIncludingMusic } = require('./audio-recoginition.controller')
const { addLikeToVideo } = require('./likes.controller')

const { Video } = require('../models/video');

exports.getVideoById = function (req, res) {
	const key = req.params.key
	const readStream = getFileStream(key)
	readStream.pipe(res);
};

exports.uploadVideo = async function (req, res) {
	console.log(req.files.video)
	// if (req.files && req.files.video) {
	// 	const file = req.files.video;

	// 	recogniteAudioFromVideo(file, function (err, newFilePath, recognizedMusics) {
	// 		// apply filter
	// 		// resize
	// 		if (err) {
	// 			res.status(400).json(err.toString());
	// 		} else {
	// 			if (recognizedMusics)
	// 				saveVideoToDatabase(newFilePath, recognizedMusics, function (err, data) {
	// 					if (!err) res.status(200).json(data);
	// 					else res.status(400).json(err);
	// 				})
	// 		}
	// 	})
	// } else {
	// 	res.status(400).json("No file");
	// 	return;
	// }
}

async function saveVideoToDatabase(newFilePath, recognizedMusics) {
	const fileSize = fs.statSync(newFilePath).size
	// const reqVideo = {
	// 	title: body.title,
	// 	size: fileSize,
	// 	description: body.description,
	// 	url: "test-url",
	// 	recognition_result: recognizedMusics,
	// }
	// checkIfIncludingMusic(reqVideo.recognition_result)

	// if (newFilePath) {
	// 	// Save to AWS
	// 	const result = await uploadFile(newFilePath)
	// 	// store result.Key in url video
	// 	const key = result.Key
	// 	reqVideo.url = key
	// 	console.log("Key: " + key)
	// 	const newVideo = new Video(reqVideo);
	// 	await newVideo.save()
	// 	console.log("Before: " + newVideo)

	// 	// TO-DO: UserID is hardcoded
	// 	// const author_id = new mongoose.mongo.ObjectId('617a508f7e3e601cad80531d')
	// 	// newVideo.author_id = author_id
	// 	// addLikeToVideo(author_id, newVideo, callback)
	// }
}

async function recogniteAudioFromVideo(file, callback) {
	analyzeVideo(file, function (err, videoSavedPath, audioSavedPath) {
		if (!err) {
			const bitmap = fs.readFileSync(audioSavedPath);
			console.log("Audio recogniting...")
			recogniteAudio(Buffer.from(bitmap), function (result) {
				console.log("Recognized")
				callback(null, videoSavedPath, result)
			})
		} else {
			callback(err, null, null)
		}
	})
	// TO-DO: Remove audios, videos

}

async function analyzeVideo(file, callback) {
	const dataBuffers = file.data
	const fileName = file.name
	const name = restrictVideoName(fileName, "617a508f7e3e601cad80531d");

	const videoSavedPath = './videos/' + fileName
	const newVideoSavedPath = './videos/' + name + "." + fileName.split('.')[1]
	const audioSavedPath = './audios/' + name + '.mp3';
	fs.writeFile(videoSavedPath, dataBuffers, function (err) {
		if (err) return console.log(err);
		console.log("Saved " + videoSavedPath);
		compressVideo(videoSavedPath, newVideoSavedPath, function (err) {
			console.log("Compressed video")
			console.log("Converting to " + audioSavedPath)
			if (!err)
				converVideoToAudio(newVideoSavedPath, audioSavedPath, function (err) {
					callback(err, newVideoSavedPath, audioSavedPath)
				})
			else
				callback("Cannot compress")
		})

	})
}

exports.registerCopyright = function () {

}

exports.approveCopyrightRegistration = function () {

}