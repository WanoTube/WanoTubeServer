const path = require('path');

exports.restrictImageName = function (fileName, userId) {
    const timeStamp = Math.floor(Date.now() /1000);
    let { name } = path.parse(fileName);
    name = name.replace(/[^a-z0-9/]/gi, '_').toLowerCase();
    return name + "_" + userId + "_" + timeStamp
}