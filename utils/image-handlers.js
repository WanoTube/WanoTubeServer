const path = require('path');

exports.restrictImageName = function (fileName, userId) {
	const timeStamp = Math.floor(Date.now() / 1000);
	const { name } = path.parse(fileName);
	lowerCaseName = name.replace(/[^a-z0-9/]/gi, '_').toLowerCase();
	return lowerCaseName + "_" + userId + "_" + timeStamp
}