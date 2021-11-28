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
    let command = ffmpeg(input)
        .videoCodec('libx265')
        .output(output)
        .on('error', function(err) {
            console.log('An error occurred: ' + err.message);
            callback(err)
        })
        .on('end', function() {
            console.log('Processing finished !');
            callback()
        });
}
exports.compressVideo = compressVideo
