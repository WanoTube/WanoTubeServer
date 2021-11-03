const fs = require('fs')
const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')
const { videosConvertToAudio } = require('../utils/convert-videos-to-audio')
const { audioRecognition } = require('./audio-recoginition.controller')

const Video = require('../models/videos');
  
exports.getVideoById = function (req, res) {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res);
    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
        res.end(err);
    });
};

exports.uploadVideo = async function (req, res) {
    const file = req.files.video
    const body = req.body
    audioRecognitionFromVideo(file, function(data) {
        res.send(JSON.stringify(data))
    })

    // apply filter
    // resize

    // saveVideoToDatabase(file, body)
}

async function saveVideoToDatabase (file, body) {
    const size = file.size
    const title = body.title
    const description = body.description

    const reqVideo = {
        "title": title,
        "size": size,
        "description": description,
        "url": "test-url",
    }
    if (file) {
        const result = await uploadFile(file)
        console.log(result)
        // store result.Key in url video
        const key = result.Key
        reqVideo.url = key
        const newVideo = new Video(reqVideo);
        newVideo.save(function (err) {
            if(err) {
                res.status(400).send(err);
            } else {
                res.send(newVideo)
            }
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