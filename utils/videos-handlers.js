const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const { trackProgress } = require('../configs/socket')

exports.converVideoToAudio = function (input, output) {
	let nextProgress = 0;
	return new Promise(async function (resolve, reject) {
		try {
			console.log("converVideoToAudio: input: ", input, ", output: ", output)
			ffmpeg(input)
				.output(output)

				.on('progress', (progress) => {
					if (progress) {
						if (nextProgress >= 100 || (nextProgress < 100 && progress.percent >= nextProgress)) {
							console.log("converVideoToAudio: ", progress.percent, "%")
							nextProgress += 15;
						}
					}
				})
				.on('error', function (err) {
					console.log('error: ', err);
					reject(err)
				})
				.on('end', function () {
					console.log('conversion ended');
					resolve(output)
				})
				.run();
		} catch (error) {
			reject(error)
		}

	});
}

function isVideoHaveAudioTrack(input) {
	return new Promise(function (resolve, reject) {
		try {
			ffmpeg(input)
				.ffprobe(function (err, data) {
					if (err)
						throw new Error(err);
					if (data)
						resolve(data.streams.length > 1);
					else if (!err)
						throw new Error('No data to track audio');
				});
		} catch (error) {
			reject(error)
		}
	})
}
exports.isVideoHaveAudioTrack = isVideoHaveAudioTrack;

async function compressVideo(input, output, app) {
	// const io = app.get('socketio');
	let nextProgress = 0;
	return new Promise(function (resolve, reject) {
		try {
			ffmpeg(input)
				// .setStartTime(2) //Can be in "HH:MM:SS" format also
				// .setDuration(10) 
				.addOutputOption(["-vcodec libx265"])
				.on("start", function (commandLine) {
					console.log("Spawned FFmpeg with command: " + commandLine);
				})
				.on('progress', (progress) => {
					if (progress) {
						if (nextProgress >= 100 || (nextProgress < 100 && progress.percent >= nextProgress)) {
							trackProgress(progress, 'Compress video');
							nextProgress += 15;
						}
					}
				})
				.on('end', function () {
					console.log('conversion ended');
					resolve('conversion ended')
				})
				.on('error', function (err) {
					console.log('error: ', err);
					reject(err)
				}).save(output)
		} catch (error) {
			reject(error)
		}

	});
}

exports.compressVideo = compressVideo

function convertToWebmFormat(input, output, app) {
	const io = app.get('socketio');
	let nextProgress = 0;
	return new Promise(function (resolve, reject) {
		try {
			console.log("Convert to webm")
			ffmpeg(input)
				.addOutputOption(["-f webm"])
				.on("start", function (commandLine) {
					console.log("Spawned FFmpeg with command: " + commandLine);
				})
				.on('progress', (progress) => {
					if (progress) {
						if (nextProgress >= 100 || (nextProgress < 100 && progress.percent >= nextProgress)) {
							trackProgress(progress, 'Convert to Webm Format');
							nextProgress += 15;
						}
					}
				})
				.on('end', function () {
					console.log('conversion ended');
					resolve('conversion ended')
				})
				.on('error', function (err) {
					console.log('error: ', err);
					reject(err)
				}).save(output)

		} catch (error) {
			reject(error)
		}

	});
}
exports.convertToWebmFormat = convertToWebmFormat;

function restrictVideoName(fileName, userId) {
	const timeStamp = Math.floor(Date.now() / 1000);
	let { name } = path.parse(fileName);
	name = name.replace(/[^a-z0-9/]/gi, '_').toLowerCase();
	return name + "_" + userId + "_" + timeStamp
}
exports.restrictVideoName = restrictVideoName
