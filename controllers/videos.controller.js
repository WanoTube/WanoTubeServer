const fs = require('fs')
const mongoose = require('mongoose');

const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')
const { compressVideo, videoConvertToAudio } = require('../utils/videos-handlers')
const { audioRecognition, musicIncluded } = require('./audio-recoginition.controller')
const { addLikeToVideo } = require('./likes.controller')

const { Video } = require('../models/video');

exports.getVideoById = function (req, res) {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res);
};

exports.uploadVideo = async function (req, res) {
    let file = req.files;
    if (req.files) {
         file = file.video
    } else {
        res.send("No file")
        return
    }
    const body = req.body
    if (body && file) {
        audioRecognitionFromVideo(file, function(err, recognizedMusics) {
            // apply filter
            // resize
            if (err) {
                res.status(400).send(err.toString())
            }
            else {
                if (recognizedMusics)
                    saveVideoToDatabase(file, body, recognizedMusics, function (err, data) {
                        if (!err) res.status(200).send(data)
                        else res.status(400).send(err);
                    })
            }
        })
    } else {
        res.status(400).send("No body")
    }
}

async function saveVideoToDatabase (file, body, recognizedMusics, callback) {
    const reqVideo = {
        "title": body.title,
        "size": file.size,
        "description": body.description,
        "url": "test-url",
        "recognitionResult": recognizedMusics,
    }
    musicIncluded(reqVideo.recognitionResult)

    if (file) {
        // Save to AWS
        const result = await uploadFile(file)
        // store result.Key in url video
        const key = result.Key
        reqVideo.url = key
        console.log("Key: " + key)
        const newVideo = new Video(reqVideo);
        console.log("Before: " + newVideo)

        // TO-DO: UserID is hardcoded
        const authorId = new mongoose.mongo.ObjectId('617a508f7e3e601cad80531d')
        newVideo.authorId = authorId
        addLikeToVideo(authorId, newVideo, callback)
    }
}

async function audioRecognitionFromVideo(file, callback) {
    const name = file.name
    const audioSavedPath = './audios/' + name.split('.')[0] + '.mp3'; 

    videoAnalysis(file, function(err){
        if (!err) {
            const bitmap = fs.readFileSync(audioSavedPath);
            console.log("Audio recogniting...")
            audioRecognition(Buffer.from(bitmap), function(result) {
                console.log("Recognized")
                callback(null, result)
            })
        } else {
            callback(err, null)
        }
    })
    // TO-DO: Remove audios, videos
}

async function videoAnalysis(file, callback){
    const dataBuffers = file.data
    const fileName = file.name
    const userId = "617a508f7e3e601cad80531d"
    const timeStamp = Math.floor(Date.now() /1000);
    const name = fileName.split('.')[0] + "_" + userId + "_" + timeStamp

    const videoSavedPath = './videos/' + fileName
    const newVideoSavedPath = './videos/' + name + "." + fileName.split('.')[1]
    const audioSavedPath = './audios/' + name + '.mp3'; 
    fs.writeFile(newVideoSavedPath, dataBuffers, function(err){
        if (err) return console.log(err);
        console.log("Saved " + newVideoSavedPath);
        console.log("Converting to " + audioSavedPath)
        videoConvertToAudio(newVideoSavedPath, audioSavedPath, function(err){
            callback(err)
        })
    })
}