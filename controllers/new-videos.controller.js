const fs = require('fs')
const path = require('path');

const mongoose = require('mongoose');

const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')
const { compressVideo, videoConvertToAudio, restrictVideoName } = require('../utils/videos-handlers')
const { audioRecognition, musicIncluded } = require('./audio-recoginition.controller')
const { addLikeToVideo } = require('./likes.controller')

const { Video } = require('../models/video');
const httpStatus = require('../utils/http-status')
exports.uploadVideo = async function (req, res) {
    let file = req.files;
    const body = req.body

    if (req.files) {
         file = file.video
    } else {
        res.status(400).send("No file")
        return
    }
    if (body && file) {
        try {
            let recognizedMusic = await audioRecognitionFromVideo(file)
            if (recognizedMusic) {
                // console.log( "recognizedMusic.savedName ", recognizedMusic.savedName )
                // console.log( "recognizedMusic.recognizeResult ", recognizedMusic.recognizeResult )
                const saveDBResult = await saveVideoToDatabase(recognizedMusic.savedName, body, recognizedMusic.recognizeResult)
                await removeRedundantFiles('./videos');
                await removeRedundantFiles('./audios');
                if (saveDBResult) res.status(200).send(saveDBResult)
                else res.status(400).send("Cannot save DB");
            }
        } catch(error) {
            console.log("error: ", error)
            if (error.message) res.status(400).send(error.message)
            else res.status(400).send(error)
        }
        
    } else {
        res.status(400).send("No body")
    }
}

async function removeRedundantFiles(directory) {
    let files = await fs.promises.readdir(directory)
    if(files.length){
        const promises = files.map(e => fs.promises.unlink(path.join(directory, e)));
        await Promise.all(promises)
    }
}

async function uploadToS3 (newFilePath) {
    return new Promise(async function(resolve, reject) {
        try {
            let reqVideo = {
                "url": "test-url",
                "videoFile": newFilePath 
            }
            if (newFilePath) {
                // Save to AWS
                const result = await uploadFile(newFilePath);
                // store result.Key in url video
                if (result) {
                    reqVideo.url = result.Key;
                    console.log("reqVideo in uploadToS3: ", reqVideo);
                    resolve(reqVideo);
                } else {
                    throw new Error("Cannot save to AWS S3");
                }
            }

        } catch (error) {
            reject(error)
        }
    });
}

async function saveVideoToDatabase (newFilePath, body, recognizedMusics) {
    return new Promise(async function(resolve, reject) {
        try {
            const fileSize = fs.statSync(newFilePath).size
            let reqVideo = {
                "title": body.title,
                "size": fileSize,
                "description": body.description,
                "url": "test-url",
                "recognitionResult": recognizedMusics,
            }
            musicIncluded(reqVideo.recognitionResult)
        
            if (newFilePath) {
                // // Save to AWS
                const s3Result = await uploadToS3(newFilePath);
                reqVideo.url = s3Result.url;
                const newVideo = new Video(reqVideo);

                // TO-DO: UserID is hardcoded
                const authorId = new mongoose.mongo.ObjectId('617a508f7e3e601cad80531d')
                newVideo.authorId = authorId
                console.log("Begin to videoAfterAddLike")

                const videoAfterAddLike =  await addLikeToVideo(authorId, newVideo);
                
                if (videoAfterAddLike) {
                    console.log("videoAfterAddLike: " + videoAfterAddLike)
                    resolve(videoAfterAddLike)
                } 
                else reject("Cannot save video to DB")
            } else {
                reject ("newFilePath not found")
            }
        } catch (error) {
            reject(error)
        }
    })
    
}

async function audioRecognitionFromVideo(file) {
    return new Promise(async function(resolve, reject) {
        try {
            if (file) {
                console.log("Recognizing audio");
                let newVideoSavedPath = await videoAnalysis(file);
                if (newVideoSavedPath) {
                    let audioSavedPath = newVideoSavedPath.split('/')[2];
                    audioSavedPath = './audios/' + audioSavedPath.split('.')[0] + '.mp3';
                    const bitmap = fs.readFileSync(audioSavedPath);
                    console.log("Audio recogniting...");
                    const recognizeResultACR = await audioRecognition(Buffer.from(bitmap));
                    let recognizeResult = {
                        "savedName": newVideoSavedPath,
                        "recognizeResult": recognizeResultACR
                    };
                    if (recognizeResult) {
                        console.log("Recognized")
                        resolve(recognizeResult)
                    } else {
                        console.log("Cannot recognize result")
                        resolve(null)
                    }
                }
            } else {
                throw new Error("file required");
            }
        } catch (error) {
            reject(error)
        }
    })
    
}

async function videoAnalysis(file) {
    const dataBuffers = file.data;
    const fileName = file.name;
    const name = restrictVideoName(fileName, "617a508f7e3e601cad80531d");

    const videoSavedPath = './videos/' + fileName;
    const newVideoSavedPath = './videos/' + name + "." + fileName.split('.')[1];
    const audioSavedPath = './audios/' + name + '.mp3'; 
    return new Promise(async function(resolve, reject) {
        try {
            console.log("Writing file: ", videoSavedPath)
            fs.writeFileSync(videoSavedPath, dataBuffers) 
            console.log("Saved " + videoSavedPath);

            await compressVideo(videoSavedPath, newVideoSavedPath) ;
            console.log("Compressed video");

            console.log("Converting to " + audioSavedPath);
            const convertResult = await videoConvertToAudio(newVideoSavedPath, audioSavedPath)
            if (convertResult) {
                console.log("Converted music")
                resolve(newVideoSavedPath);
            } else {
                throw new Error("Cannot convert music")
            }
        } catch (error) {
            reject(error);
        }
    })  
}