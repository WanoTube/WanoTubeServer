const { Like } = require('../models/like');
const Video = require('../models/video');

exports.getAllLikes = function (req, res) {
    const id = req.params.id
    Video.findById(id)
        .exec(function(err, result) {
            if (!err)
                res.send(result.likes)
            else
                res.send(err)
        })  
};

exports.likeVideo = function (req, res) {
    const body = req.body
    console.log(body)
    body.targetId // videoId: the video being liked
    body.authorId // userId : the person like video

    // find if like is null => add
    // else => unlike

    // likes.count => all likes of the videos

}

exports.addLikeToVideo = function(authorId, targetId, newVideo, callback) {
    var like = new Like({ "authorId": authorId, "targetId": targetId})
    like.save()
        .then(function (err) {
            newVideo.likes.push(like) // Yes
            newVideo.save().then(function(err) { // No
                console.log(newVideo)
                callback(err, newVideo)
            });
        });
}