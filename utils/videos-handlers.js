const ffmpeg = require('fluent-ffmpeg');

async function videoConvertToAudio(input, output) {
    let isAudioIncluded = true;
    // const result = await isVideoHaveAudioTrack(input);
    // isAudioIncluded = result;
    
    return new Promise(function(resolve, reject) {
        try {
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

// async function videoConvertToAudio(input, output, callback) {
//     let isAudioIncluded = false;
//     isVideoHaveAudioTrack(input, function (result) {
//         isAudioIncluded = result;
//         if (isAudioIncluded) {
//             ffmpeg(input)
//             .output(output)
//             .on('end', function() {                    
//                 console.log('conversion ended');
//                 callback(null);
//             })
//             .on('error', function(err){
//                 console.log('error: ', err);
//                 callback(err);
//             }).run();
//         } else {
//             callback("Video doesn't have audio")
//         }
//     })
    
// }
exports.videoConvertToAudio = videoConvertToAudio

function isVideoHaveAudioTrack(input) {
    return new Promise(function(resolve, reject) {
        ffmpeg(input).ffprobe(function(err, data) {
            if (data)
                resolve(data.streams.length > 1);
            else if (!err)
                reject("data is null")
            else 
                reject(err);
        });
    })
    
}

// function isVideoHaveAudioTrack(input, callback) {
//     ffmpeg(input).ffprobe(function(err, data) {
//         callback(data.streams.length > 1) 
//       });
// }

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

// function compressVideo(input, output, callback) {
//     ffmpeg(input)
//     .audioCodec('copy')
//     .output(output)
//     // phải để ở vị trí này
//     .on('end', function() {                    
//         console.log('conversion ended');
//         callback(null);
//     })
//     .on('error', function(err){
//         console.log('error: ', err);
//         callback(err);
//     }).run();
// }
exports.compressVideo = compressVideo

function restrictVideoName(fileName, userId) {
    const timeStamp = Math.floor(Date.now() /1000);
    return fileName.split('.')[0] + "_" + userId + "_" + timeStamp
}
exports.restrictVideoName = restrictVideoName
