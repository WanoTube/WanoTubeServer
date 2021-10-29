const { uploadFile, getFileStream } = require('../utils/s3')
const Video = require('../models/videos');

exports.getVideoById = function (req, res) {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res)
};

exports.uploadVideo = async function (req, res) {
    const file = req.files
    const body = req.body
    const title = body.title
    const size = file.video.size
    const description = body.description

    const reqVideo = {
        "title": title,
        "size": size,
        "description": description,
        "url": "ABC"
    }
    // apply filter
    // resize
    console.log(file)

    if (file) {
        const result = await uploadFile(file)
        console.log(result)
        res.status(200)
        // store result.Key in url video
        reqVideo.url = result.Key
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