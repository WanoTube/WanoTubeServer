const { Video } = require('../models/video');
const { deleteFile } = require('../utils/aws-s3-handlers')

const mongoose = require('mongoose');

exports.createVideoInfos = function (video) {
    return new Promise(async function(resolve, reject) { 
        try {
            const videoSaved = await video.save();
            if (videoSaved) {
                console.log(video);
                resolve(video);
            } else {
                throw new Error('Cannot save video')
            }
        } catch (error) {
            reject(error);
        }
    });
}

exports.getAllVideoInfos = function (req,res) {
    Video.find()
        .then(function(doc) {
            res.send(doc)
        })
}

exports.getAllVideoInfosWithUserId = function (req,res) {
    const authId = new mongoose.mongo.ObjectId(req.params.author_id)
    Video.find({author_id: authId})
        .then(function(doc) {
            res.send(doc)
        })
}

exports.getVideoInfoById = function (req, res) {
    const id = req.params.id
    console.log("id: ", id)
    Video.findById(id)
        .exec(function(err, result) {
            if (!err)
                res.send(result)
            else
                res.send(err)
        })
};

exports.search = function (req, res) {
    console.log("Searching..")
    const searchKey = req.query.search_query
    // TO-DO: SEARCH IN TITLE, not whole title
    Video.
        find({
            title: searchKey,
        })
        .exec(function(err, result) {
            if (!err)
                res.send(result)
            else
                res.send(err)
        })
};

exports.updateVideoInfo = function (req, res) {
    const body = req.body
    const id = body.id;
    Video.findById(id)
        .exec(function(err, video) {
            if (err) {
                console.error('error, no entry found');
                res.send(err)
            }
            else {
                video.title = body.title ? body.title : video.title;
                video.description = body.description ? body.description : video.description;
                video.url = body.url ? body.url : video.url;
                video.size = body.size ? body.size : video.size;
                video.save();
                res.send(video)
            }
        })
}

exports.deleteVideoInfo = async function (req, res) {
    const id = req.body.id
    const url = req.body.url
    console.log(req.body)
    try {
        await deleteFile(url)
        try {
            const data = await Video.deleteOne({ id: id });
            res.status(200).send(data);
        } catch(error) {
            res.send(error);
        }
    } catch (error) {
        res.send(error);
    }
}