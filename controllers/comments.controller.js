const { Comment } = require('../models/like');
const Video = require('../models/video');

exports.getAllComments = function (req, res) {
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
    const videoId = body.targetId // videoId: the video being liked
    const userId = body.authorId // userId : the person like video
    const content = body.content // content of the comment

    Video.findById(videoId)
        .exec(function(err, result) {
        })
    
}

function addComment(authorId, video, callback) {
}