const ffmpeg = require('fluent-ffmpeg');

async function videoConvertToAudio(input, output, callback) {
    let isAudioIncluded = false;
    isVideoHaveAudioTrack(input, function (result) {
        isAudioIncluded = result;
        if (isAudioIncluded) {
            ffmpeg(input)
            .output(output)
            .on('end', function() {                    
                console.log('conversion ended');
                callback(null);
            })
            .on('error', function(err){
                console.log('error: ', err);
                callback(err);
            }).run();
        } else {
            callback("Video doesn't have audio")
        }
    })
    
}
exports.videoConvertToAudio = videoConvertToAudio

function isVideoHaveAudioTrack(input, callback) {
    ffmpeg(input).ffprobe(function(err, data) {
        callback(data.streams.length > 1) 
      });
}

function compressVideo(input, output, callback) {
    ffmpeg(input)
    .audioCodec('copy')
    .output(output)
    // phải để ở vị trí này
    .on('end', function() {                    
        console.log('conversion ended');
        callback(null);
    })
    .on('error', function(err){
        console.log('error: ', err);
        callback(err);
    }).run();
}
exports.compressVideo = compressVideo

function restrictVideoName(fileName, userId) {
    const timeStamp = Math.floor(Date.now() /1000);
    return fileName.split('.')[0] + "_" + userId + "_" + timeStamp
}
exports.restrictVideoName = restrictVideoName
