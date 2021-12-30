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

exports.getTotalCommentsByVideoId = async function (req, res) {
    const id = req.params.id
    try {
        const video = await Video.findById(id)
        res.status(200).send(JSON.stringify(video.total_comments));
    } catch (error) {
        res.send(error);
    }
};

exports.commentVideo = function (req, res) {
    const body = req.body
    console.log(body)
    const video_id = body.video_id // video_id: the video being liked
    const userId = body.author_id // userId : the person like video
    const content = body.content // content of the comment

    Video.findById(video_id)
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

function addComment(author_id, video, content, callback) {
    var comment = new Comment({ "author_id": author_id, "video_id": video.id, "content": content})
    comment.save()
        .then(function (err) {
            video.comments.push(comment);
            video.total_comments += 1;
            video.save().then(function(err) { 
                console.log(video)
                callback(err, video)
            });
        });
}

exports.deleteCommentFromVideo = function (req, res) {
    const body = req.body
    const author_id = body.author_id
    const video_id = body.video_id
    Video.findById(video_id)
        .exec(function(err, video) {
            if (video && !err) {
                if (video.comments.length <= 0) {
                    removeCommentFromVideo(author_id, video, function(result) {
                        res.send(result)
                    })
                }
            } else {
                if (err) res.send(err)
                else res.send("Video not found")
            }
        })
}

function removeCommentFromVideo (author_id, video, callback) {
    Video.findByIdAndUpdate(video.id, {
        $pull: {
            comments: {author_id: author_id}
        }
    }, function () {
        Comment.deleteOne({author_id:author_id, video_id: video.id}, callback(result))
    })
}

exports.deleteCommentInfo = function (req, res) {
    const author_id = new mongoose.mongo.ObjectId(req.query.author_id)
    const video_id = new mongoose.mongo.ObjectId(req.query.video_id)
    console.log(req.query)
    if (author_id && video_id) {
        Comment.deleteOne({ author_id: author_id, video_id: video_id }) //delete the first one it found
            .then(function(data) {
                console.log(data)
                res.status(200).send(data)
            })
    } else {
        res.send("author_id and video_id is invalid")
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
        res.send("author_id and video_id is invalid")
    }
}