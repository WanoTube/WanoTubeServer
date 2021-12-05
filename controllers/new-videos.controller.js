const fs = require('fs')
const path = require('path');

const mongoose = require('mongoose');

const { uploadFile, getFileStream } = require('../utils/aws-s3-handlers')
const { compressVideo, videoConvertToAudio, restrictVideoName, isVideoHaveAudioTrack } = require('../utils/videos-handlers')
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
            let analizedVideo = await videoAnalysis(file);
            await uploadToS3(analizedVideo);
            let recognizedMusic = await audioRecognitionFromVideo(analizedVideo);
            const saveDBResult = await saveVideoToDatabase(analizedVideo, body, recognizedMusic)
            await removeRedundantFiles('./videos');
            await removeRedundantFiles('./audios');
            if (saveDBResult) res.status(200).send(saveDBResult)
            else res.status(400).send("Cannot save DB");
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

function uploadToS3 (newFilePath) {
    return new Promise(function(resolve, reject) {
        try {
            // reqVideo is redundant
            let reqVideo = {
                "url": "test-url",
                "videoFile": newFilePath 
            }
            if (newFilePath) {
                // Save to AWS
                uploadFile(newFilePath)
                .on('httpUploadProgress', function(progress) {
                    let progressPercentage = Math.round(progress.loaded / progress.total * 100);
                    console.log("Upload to S3: " + progressPercentage + "%");

                    progressBar.style.width = progressPercentage + "%";

                    // if (progressPercentage < 100) {
                    //   fileUpload.progressStatus = progressPercentage;
             
                    // } else if (progressPercentage == 100) {
                    //   fileUpload.progressStatus = progressPercentage;
             
                    //   fileUpload.status = "Uploaded";
                    // }
                  });
                  resolve(reqVideo);
            }
        } catch (error) {
            reject(error)
        }
    });
}

async function saveVideoToDatabase (newFilePath, body, recognizedMusics) {
    return new Promise(async function(resolve, reject) {
        try {
            if (recognizedMusics) {
                console.log("recognizedMusics: ", recognizedMusics);
                recognizedMusics = recognizedMusics.recognizeResult;
                if (recognizedMusics)
                    musicIncluded(recognizedMusics)
            }
            const fileSize = fs.statSync(newFilePath).size;
            const { name } = path.parse(newFilePath);
            let reqVideo = {
                "title": body.title,
                "size": fileSize,
                "description": body.description,
                "url": name,
                "recognitionResult": recognizedMusics,
            }
        
            if (newFilePath) {
                // Save to AWS
                // const s3Result = await uploadToS3(newFilePath);
                // reqVideo.url = s3Result.url;
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

async function audioRecognitionFromVideo(newVideoSavedPath) {
    return new Promise(async function(resolve, reject) {
        try {
            const { name } = path.parse(newVideoSavedPath);
            console.log("NAME: " + name);
            const audioSavedPath = './audios/' + name + '.mp3'; 

            if (newVideoSavedPath) {
                let isAudioIncluded = true;
                isAudioIncluded = await isVideoHaveAudioTrack(newVideoSavedPath);
                if (isAudioIncluded == true) {
                    console.log("Converting to " + audioSavedPath);
                    const convertResult = await videoConvertToAudio(newVideoSavedPath, audioSavedPath)
                    if (convertResult) {
                        console.log("Converted music")
                    } else {
                        throw new Error("Cannot convert music")
                    }
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

async function videoAnalysis(file) {
    const dataBuffers = file.data;
    const fileName = file.name;
    const { ext } = path.parse(fileName);
    const name = restrictVideoName(fileName, "617a508f7e3e601cad80531d");
    console.log("New name: ", name);

    const videoSavedPath = './videos/' + fileName;
    const newVideoSavedPath = './videos/' + name + ext;
    return new Promise(async function(resolve, reject) {
        try {
            // Because if webm we will not compress video. But if we compress video, we need to have 2 paths
            let willSavePath = (ext.localeCompare(".webm") != 0) ? videoSavedPath : newVideoSavedPath;
            console.log("Writing file: ", willSavePath)
            fs.writeFileSync(willSavePath, dataBuffers) 
            console.log("Saved " + willSavePath);     
            if (ext.localeCompare(".webm") != 0) {
                await compressVideo(videoSavedPath, newVideoSavedPath) ;
                console.log("Compressed video");
            }
            resolve(willSavePath);
        } catch (error) {
            reject(error);
        }
    })  
}