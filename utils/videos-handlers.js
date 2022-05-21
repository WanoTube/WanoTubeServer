const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const { trackUploadS3Progress } = require('../configs/socket');
const { getSignedUrl } = require('./aws/s3');
const Account = require('../models/account');

const converVideoToAudio = function (input, output) {
	let nextProgress = 0;
	return new Promise(async function (resolve, reject) {
		try {
			ffmpeg(input)
				.output(output)

				.on('progress', (progress) => {
					if (progress) {
						if (nextProgress >= 100 || (nextProgress < 100 && progress.percent >= nextProgress)) {
							nextProgress += 15;
						}
					}
				})
				.on('error', function (err) {
					reject(err)
				})
				.on('end', function () {
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

async function compressVideo(input, output) {
	let nextProgress = 0;
	return new Promise(function (resolve, reject) {
		try {
			ffmpeg(input)
				.addOutputOption(["-vcodec libx265"])
				.on("start", function (commandLine) {
					console.log("Spawned FFmpeg with command: " + commandLine);
				})
				.on('progress', (progress) => {
					if (progress) {
						if (nextProgress >= 100 || (nextProgress < 100 && progress.percent >= nextProgress)) {
							// trackUploadS3Progress(progress, 'Compress video');
							nextProgress += 15;
						}
					}
				})
				.on('end', function () {
					console.log('conversion ended');
					resolve('conversion ended')
				})
				.on('error', function (err) {
					reject(err)
				}).save(output)
		} catch (error) {
			reject(error)
		}

	});
}

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
							// trackUploadS3Progress(progress, 'Convert to Webm Format');
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

function generateThumbnail(videoFilePath, channelId) {
	let autogeneratedThumbnailsKey = [];
	let nextProgress = 0;
	console.log("begin generate thumbnail")
	return new Promise(function (resolve, reject) {
		try {
			ffmpeg(videoFilePath)
				.on('filenames', function (filenames) {
					filenames.forEach(filename => {
						console.log('Will generate ' + filename);
						autogeneratedThumbnailsKey.push("uploads/thumbnails/" + filename);
					});
				})
				.on('progress', (progress) => {
					console.log('progress')
					if (progress) {
						if (nextProgress >= 100 || (nextProgress < 100 && progress.percent >= nextProgress)) {
							trackUploadS3Progress(progress / 4 + 25, channelId);
							nextProgress += 15;
						}
					}
				})
				.on('end', function () {
					console.log('Screenshots taken');
					resolve({ autogeneratedThumbnailsKey, thumbnailKey: autogeneratedThumbnailsKey[0] });
				})
				.screenshots({
					// Will take screens at 20%, 40%, 60% and 80% of the video
					count: 3,
					folder: 'uploads/thumbnails',
					size: '1280x720',
					// %b input basename ( filename w/o extension )
					filename: 'thumbnail-%b.png'
				});
		}
		catch (err) {
			console.log(err)
			reject(err);
		}
	});
}

function encodeFileName(fileName, userId) {
	const timeStamp = Math.floor(Date.now() / 1000);
	let { name } = path.parse(fileName);
	name = name.replace(/[^a-z0-9/]/gi, '_').toLowerCase();
	return name + "_" + userId + "_" + timeStamp
}

function seperateTitleAndExtension(fileName) {
	const fileNameSplittedArray = fileName.split('.');
	const extension = fileNameSplittedArray.pop();
	const title = fileNameSplittedArray.join('.');
	return { title, extension };
}

async function generateFileFromBuffer(file, authorId, folder = "videos") {
	const { data: dataBuffers, name: fileName } = file;
	const { ext } = path.parse(fileName);
	const encodedFileName = encodeFileName(fileName, authorId);
	const { title } = seperateTitleAndExtension(fileName);
	const fileKey = `uploads/${folder}/` + encodedFileName + ext;

	return new Promise(function (resolve, reject) {
		try {
			fs.writeFileSync(fileKey, dataBuffers);
			resolve({
				title,
				fileKey
			});
		}
		catch (err) {
			reject(err);
		}
	})
}

async function formatVideo(video, returnThumbnailList = false) {
	const formattedDoc = { ...video };

	if (formattedDoc.video_key)
		formattedDoc.url = getSignedUrl({ key: formattedDoc.video_key });
	delete formattedDoc.video_key;

	if (formattedDoc.thumbnail_key) {
		formattedDoc.thumbnail_url = getSignedUrl({ key: formattedDoc.thumbnail_key });
		if (returnThumbnailList
			&& formattedDoc.autogenerated_thumbnails_key
			&& formattedDoc.autogenerated_thumbnails_key.length === 3) {
			formattedDoc.autogenerated_thumbnails_url = formattedDoc.autogenerated_thumbnails_key.map(key => getSignedUrl({ key }));
			formattedDoc.thumbnail_key_index = formattedDoc.autogenerated_thumbnails_key.indexOf(formattedDoc.thumbnail_key) + 1;
			console.log(formattedDoc.thumbnail_key_index)
		}
	}
	delete formattedDoc.thumbnail_key;
	delete formattedDoc.autogenerated_thumbnails_key;

	const channelAccount = await Account.findOne({ user_id: video.author_id }).populate("user_id");
	formattedDoc.user = { ...channelAccount, avatar: channelAccount.user_id.avatar, username: channelAccount.username, channel_id: channelAccount._id };
	delete formattedDoc.author_id;
	return formattedDoc;
}

module.exports = {
	encodeFileName,
	convertToWebmFormat,
	compressVideo,
	isVideoHaveAudioTrack,
	converVideoToAudio,
	generateThumbnail,
	seperateTitleAndExtension,
	generateFileFromBuffer,
	formatVideo
}
