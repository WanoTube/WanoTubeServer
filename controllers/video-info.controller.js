const { Video } = require('../models/video');
const mongoose = require('mongoose');

exports.getAllVideoInfos = function (req,res) {
    Video.find()
        .then(function(doc) {
            res.send(doc)
        })
}

exports.getAllVideoInfosWithUserId = function (req,res) {
    const authId = new mongoose.mongo.ObjectId(req.params.authorId)
    Video.find({authorId: authId})
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
    const id = req.params.id
    console.log(id)
    Video.deleteOne({ id: id })
        .then(function(data) {
            res.status(200)
        })
}