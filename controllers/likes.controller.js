const { Like } = require('../models/like');
const { Video } = require('../models/video');
const mongoose = require('mongoose');

exports.getAllLikes = function (req, res) {
    Like.find()
        .then(function(doc) {
            res.send(doc)
        })
}

exports.getAllLikesByvideo_id = function (req, res) {
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
    const video_id = body.target_id // video_id: the video being liked
    const userId = body.author_id // userId : the person like video

    Video.findById(video_id)
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

function addLikeToVideo(author_id, video) {
    return new Promise(function (resolve, reject) {
        try {
            let like = new Like({ "author_id": author_id, "target_id": video.id});
            console.log(like);
            like.save()
                .then(async function (savedData) {
                    if (savedData) {
                        video.total_likes += 1;
                        video.likes.push(like) ;
                        const videoSaved = await video.save();
                        if (videoSaved) {
                            console.log(video);
                            resolve(video);
                        } else {
                            throw new Error('Cannot save video')
                        }
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

exports.addLikeToVideo = addLikeToVideo

function removeLikeFromVideo(author_id, video, callback) {
    Video.findByIdAndUpdate(video.id, {
        $pull: {
            likes: {author_id: author_id}
        }
    }, function () {
        Like.deleteOne({author_id:author_id, target_id: video.id}, callback(video))
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
    const author_id = new mongoose.mongo.ObjectId(req.query.author_id)
    const target_id = new mongoose.mongo.ObjectId(req.query.target_id)

    if (author_id && target_id) {
        Like.deleteOne({ author_id: author_id, target_id: target_id }) //delete the first one it found
            .then(function(data) {
                res.status(200).send(data)
            })
    } else {
        res.send("author_id and target_id is invalid")
    }
}