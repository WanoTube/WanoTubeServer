const { Video } = require('../models/video');
const { Comment } = require('../models/comment');
const mongoose = require('mongoose');

exports.getAllCommentsByVideoId = function (req, res) {
    const id = req.params.id
    Video.findById(id)
        .exec(function(err, result) {
            if (!err) {
                if (result) res.send(result.comments)
                else res.send("Cannot find video")
            } else
                res.send(err)
        })  
};

exports.commentVideo = function (req, res) {
    const body = req.body
    console.log(body)
    const videoId = body.videoId // videoId: the video being liked
    const userId = body.authorId // userId : the person like video
    const content = body.content // content of the comment

    Video.findById(videoId)
        .exec(function(err, video) {
            // Add comment
            if (video) {
                addComment(userId, video, content, function (err, video) {
                    if (!err && video) res.send(video)
                    else {
                        if (err) res.send(err)
                        else res.send("Video is null")
                    }
                })
            } else res.send("Video not found")
        })
    
}

function addComment(authorId, video, content, callback) {
    var comment = new Comment({ "authorId": authorId, "videoId": video.id, "content": content})
    comment.save()
        .then(function (err) {
            video.comments.push(comment)
            video.save().then(function(err) { 
                console.log(video)
                callback(err, video)
            });
        });
}

exports.deleteCommentFromVideo = function (req, res) {
    const body = req.body
    const authorId = body.authorId
    const videoId = body.videoId
    Video.findById(videoId)
        .exec(function(err, video) {
            if (video && !err) {
                if (video.comments.length <= 0) {
                    removeCommentFromVideo(authorId, video, function(result) {
                        res.send(result)
                    })
                }
            } else {
                if (err) res.send(err)
                else res.send("Video not found")
            }
        })
}

function removeCommentFromVideo (authorId, video, callback) {
    Video.findByIdAndUpdate(video.id, {
        $pull: {
            comments: {authorId: authorId}
        }
    }, function () {
        Comment.deleteOne({authorId:authorId, videoId: video.id}, callback(result))
    })
}

exports.deleteCommentInfo = function (req, res) {
    const authorId = new mongoose.mongo.ObjectId(req.query.authorId)
    const videoId = new mongoose.mongo.ObjectId(req.query.videoId)
    console.log(req.query)
    if (authorId && videoId) {
        Comment.deleteOne({ authorId: authorId, videoId: videoId }) //delete the first one it found
            .then(function(data) {
                console.log(data)
                res.status(200).send(data)
            })
    } else {
        res.send("authorId and videoId is invalid")
    }
}

exports.deleteCommentInfoById = function (req, res) {
    const id = req.params.id
    if (id) {
        Comment.deleteOne({ id: id}) //delete the first one it found
            .then(function(data) {
                console.log(data)
                res.status(200).send(data)
            })
    } else {
        res.send("authorId and videoId is invalid")
    }
}