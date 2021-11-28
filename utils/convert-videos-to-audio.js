const ffmpeg = require('fluent-ffmpeg');

async function videosConvertToAudio(input, output, callback) {
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

function isVideoHaveAudioTrack(input, callback) {
    ffmpeg(input).ffprobe(function(err, data) {
        callback(data.streams.length > 1) 
      });
}
exports.videosConvertToAudio = videosConvertToAudio