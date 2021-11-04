const fs = require('fs')
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')
const { videosConvertToAudio } = require('../utils/convert-videos-to-audio')
const { audioRecognition, musicIncluded } = require('./audio-recoginition.controller')

const Video = require('../models/videos');
  
exports.getVideoById = function (req, res) {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res);
};

exports.uploadVideo = async function (req, res) {
    const file = req.files.video
    const body = req.body
    audioRecognitionFromVideo(file, function(recognizedMusics) {
        // apply filter
        // resize

        saveVideoToDatabase(file, body, recognizedMusics, function (err, data) {
            if (!err) res.send(data)
            else res.status(400).send(err);
        })
    })
}

async function saveVideoToDatabase (file, body, recognizedMusics, callback) {
    const size = file.size
    const title = body.title
    const description = body.description

    const reqVideo = {
        "title": title,
        "size": size,
        "description": description,
        "url": "test-url",
        "recognitionResult": recognizedMusics
    }

    musicIncluded(reqVideo.recognitionResult)

    if (file) {
        const result = await uploadFile(file)
        // console.log(result)
        // store result.Key in url video
        const key = result.Key
        reqVideo.url = key
        console.log("Key: " + key)
        const newVideo = new Video(reqVideo);
        newVideo.save(function (err) {
            callback(err, newVideo)
        });
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
                callback(result)
            })
        }
    })
    // TO-DO: Remove audios, videos
}

async function videoAnalysis(file, callback){
    const dataBuffers = file.data
    const name = file.name
    // Check same name?
    const videoSavedPath = './videos/' + name
    const audioSavedPath = './audios/' + name.split('.')[0] + '.mp3'; 
    // console.log(audioSavedPath)

    fs.writeFile(videoSavedPath, dataBuffers, function(err){
        if (err) return console.log(err);
        console.log("Saved " + videoSavedPath);
        console.log("Converting to " + audioSavedPath)
        videosConvertToAudio(videoSavedPath, audioSavedPath, function(err){
            callback(err)
        })
    })
}