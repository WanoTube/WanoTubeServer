const Like = require('../models/like');
const Video = require('../models/video');

exports.getAllLikes = function (req, res) {
    const id = req.params.id
    Video.findById(id)
        .exec(function(err, result) {
            console.log("id:" + id + " result.id " + result.id)
            if (!err)
                res.send(result.likes)
            else
                res.send(err)
        })  
};
