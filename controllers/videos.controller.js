const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const { uploadFile, getFileStream } = require('../utils/s3')

const Video = require('../models/videos');

exports.getVideoById = function (req, res) {
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.pipe(res)
};

exports.uploadVideo = async function (req, res) {
    const file = req.file
    console.log(req.file)

    // apply filter
    // resize

    const result = await uploadFile(file)
    await unlinkFile(file.path)
    console.log(result)
    res.send({imagePath: `/images/${result.Key}`})
}