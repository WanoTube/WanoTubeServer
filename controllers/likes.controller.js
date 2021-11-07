const Like = require('../models/like');
const Video = require('../models/video');

exports.getAllLikes = function (req, res) {
    const id = req.params.id
    Video.findOne({ id: id })
        .exec(function(err, result) {
            if (!err)
                res.send(result.likes)
            else
                res.send(err)
        })
};
