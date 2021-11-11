const { Like } = require('../models/like');
const Video = require('../models/video');

exports.getAllLikes = function (req, res) {
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
                    removeLikeToVideo(userId, result, function(video) {
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

function addLikeToVideo(authorId, video, callback) {
    video.authorId = authorId
    var like = new Like({ "authorId": authorId, "targetId": video.id})
    console.log(like)
    like.save()
        .then(function (err) {
            video.likes.push(like) // Yes
            video.save().then(function(err) { // No
                console.log(video)
                callback(err, video)
            });
        });
}
exports.addLikeToVideo = addLikeToVideo

function removeLikeToVideo(authorId, video, callback) {
    if (video.likes) {
        Video.findByIdAndUpdate(video.id, {
            $pull: {
                likes: {authorId: authorId}
            }
        }, callback(video))
        //Like.deleteOne({}) // should we delete the like from Like document
    }
}
exports.removeLikeToVideo = removeLikeToVideo
