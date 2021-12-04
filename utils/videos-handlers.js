const ffmpeg = require('fluent-ffmpeg');

async function videoConvertToAudio(input, output) {
    return new Promise(async function(resolve, reject) {
        try {
            let isAudioIncluded = true;
            const result = await isVideoHaveAudioTrack(input);
            isAudioIncluded = result;
            if (isAudioIncluded) {
                console.log("videoConvertToAudio: input: ", input, ", output: ", output)
        
                ffmpeg(input)
                .output(output)
               
                .on('progress', (progress) => {
                    console.log('Processing: ' + progress.targetSize + ' KB converted');
                })
                .on('error', function(err){
                    console.log('error: ', err);
                    reject(err)
                })
                .on('end', function() {                    
                    console.log('conversion ended');
                    resolve(output)
                })
                .run();
            } else {
                reject("Video doesn't have audio")
            }
        } catch (error) {
            reject(error)
        }
        
    });
}

exports.videoConvertToAudio = videoConvertToAudio

function isVideoHaveAudioTrack(input) {
    return new Promise(function(resolve, reject) {
        try {
            ffmpeg(input)
            .ffprobe(function(err, data) {
                if (err) 
                    throw new Error(err);
                if (data)
                    resolve(data.streams.length > 1);
                else if (!err)
                    throw new Error('No data to track audio');
            });
        } catch (error) {
            reject(error)
        }
    })
}

async function compressVideo(input, output) {
    return new Promise(function(resolve, reject) {
        try {
            ffmpeg(input)
            .audioCodec('copy')
            .output(output)
            // phải để ở vị trí này
            .on('end', function() {                    
                console.log('conversion ended');
                resolve('conversion ended')
            })
            .on('error', function(err){
                console.log('error: ', err);
                reject(err)
            }).run();
        } catch (error) {
            reject(error)
        }
        
    });
    
}

exports.compressVideo = compressVideo

function restrictVideoName(fileName, userId) {
    const timeStamp = Math.floor(Date.now() /1000);
    return fileName.split('.')[0] + "_" + userId + "_" + timeStamp
}
exports.restrictVideoName = restrictVideoName
