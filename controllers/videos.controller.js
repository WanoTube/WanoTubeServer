const fs = require('fs')
const util = require('util')

const { uploadFile, getFileStream } = require('../utils/s3')
const Video = require('../models/videos');

const unlinkFile = util.promisify(fs.unlink)

exports.getVideoById = function (req, res) {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res)
};

exports.uploadVideo = async function (req, res) {
    const file = req.file
    const body = req.body
    const title = body.title
    const size = file.size
    const description = body.description

    const reqVideo = {
        "title": title,
        "size": size,
        "description": description,
    }
    // apply filter
    // resize

    if (file) {
        const result = await uploadFile(file)
        await unlinkFile(file.path) // delete junk binary files in /uploads
        
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