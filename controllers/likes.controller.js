const { Like } = require('../models/like');
const { Video } = require('../models/video');
const mongoose = require('mongoose');

exports.getAllLikes = function (req, res) {
    Like.find()
        .then(function(doc) {
            res.send(doc)
        })
}

exports.getAllLikesByVideoId = function (req, res) {
    const id = req.params.id
    Video.findById(id)
        .exec(function(err, result) {
            if (!err) {
                if (result) res.send(result.likes)
                else res.send("Cannot find video")
            } else
                res.send(err)
        })  
};

exports.likeVideo = function (req, res) {
    const body = req.body
    console.log(body)
    const videoId = body.targetId // videoId: the video being liked
    const userId = body.authorId // userId : the person like video

    Video.findById(videoId)
        .exec(function(err, result) {
            if (result && !err) {
                if (result.likes.length <= 0) {
                    // find if like is null => add
                    addLikeToVideo(userId, result, function(err, video) {
                        if (!err) res.send(video)
                        else res.send(err)
                    })
                } else {
                    // else => unlike => remove like from video
                    // remove likes have this userId 
                    removeLikeFromVideo(userId, result, function(video) {
                        if (video) res.send(video)
                        else res.send("Cannot remove")
                    })
                }
            } else {
                if (!result) res.send("Cannot find video")
                else res.send(err)
            }
        })
    

    // likes.count => all likes of the videos

}

function addLikeToVideo(authorId, video) {
    return new Promise(function (resolve, reject) {
        try {
            let like = new Like({ "authorId": authorId, "targetId": video.id});
            console.log(like);
            like.save()
                .then(function (savedData) {
                    if (savedData) {
                        video.likes.push(like) ;
                        video.save().then(function(videoSaved) { 
                            if (videoSaved) {
                                console.log(video);
                                resolve(video);
                            } else {
                                throw new Error('Cannot save video')
                            }
                        });
                    } else { 
                        throw new Error('Cannot save like')
                    }
                })
                .catch(function(error) {
                    throw new Error(error)
                })
        } catch (error) {
            reject(error);
        }
    });
}

// function addLikeToVideo(authorId, video, callback) {
//     var like = new Like({ "authorId": authorId, "targetId": video.id})
//     console.log(like)
//     like.save()
//         .then(function (err) {
//             video.likes.push(like) 
//             video.save().then(function(err) { 
//                 console.log(video)
//                 callback(err, video)
//             });
//         });
// }
exports.addLikeToVideo = addLikeToVideo

function removeLikeFromVideo(authorId, video, callback) {
    Video.findByIdAndUpdate(video.id, {
        $pull: {
            likes: {authorId: authorId}
        }
    }, function () {
        Like.deleteOne({authorId:authorId, targetId: video.id}, callback(video))
    })
}
exports.removeLikeFromVideo = removeLikeFromVideo

exports.deleteLikeInfoById = function (req, res) {
    const id = req.params.id
    console.log(id)
    Like.deleteOne({ id: id })
        .then(function(data) {
            res.status(200).send(data)
        })
}

exports.deleteLikeInfo = function (req, res) {
    const authorId = new mongoose.mongo.ObjectId(req.query.authorId)
    const targetId = new mongoose.mongo.ObjectId(req.query.targetId)

    if (authorId && targetId) {
        Like.deleteOne({ authorId: authorId, targetId: targetId }) //delete the first one it found
            .then(function(data) {
                res.status(200).send(data)
            })
    } else {
        res.send("authorId and targetId is invalid")
    }
}