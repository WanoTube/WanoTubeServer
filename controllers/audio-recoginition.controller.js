const crypto = require('crypto');
const request = require('request');

const { ACRCLOUD_HOST, ACRCLOUD_ACCESS_KEY, ACRCLOUD_SECRET_KEY } = process.env

const defaultOptions = {
  host: ACRCLOUD_HOST,
  endpoint: '/v1/identify',
  signature_version: '1',
  data_type: 'audio',
  secure: true,
  access_key: ACRCLOUD_ACCESS_KEY,
  access_secret: ACRCLOUD_SECRET_KEY
};

function buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
  return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
}

function sign(signString, accessSecret) {
  return crypto.createHmac('sha1', accessSecret)
    .update(Buffer.from(signString, 'utf-8'))
    .digest().toString('base64');
}

/**
 * Identifies a sample of bytes
 */
function identify(data, options, cb) {

  const current_data = new Date();
  const timestamp = current_data.getTime() / 1000;

  const stringToSign = buildStringToSign('POST',
    options.endpoint,
    options.access_key,
    options.data_type,
    options.signature_version,
    timestamp);

  const signature = sign(stringToSign, options.access_secret);

  const formData = {
    sample: data,
    access_key: options.access_key,
    data_type: options.data_type,
    signature_version: options.signature_version,
    sample_bytes: data.length,
    signature,
    timestamp,
  }
  request.post({
    url: "http://" + options.host + options.endpoint,
    method: 'POST',
    formData: formData
  }, cb);
}

function recogniteAudio(data) {
  console.log(".....................data", data)
  return new Promise(function (resolve, reject) {
    identify(Buffer.from(data), defaultOptions, function (err, httpResponse, body) {
      console.log("hello")
      console.log(err, httpResponse, body)
      console.log("bye")
      if (err) reject(err.msg);
      else {
        const result = JSON.parse(body);
        console.log(".....................result", result)
        if (result) {
          resolve(result);
        } else {
          reject("Cannot recognize music");
        }
      }
    });
  })
}

exports.recogniteAudio = recogniteAudio

function checkIfIncludingMusic(data) {
  const first = data.musics[0]
  const title = first.title
  const album = first.album.name
  const artists = first.artists // array
  const songArtist = artists[0].name

  const jsonResult = { title, album, songArtist }
  return jsonResult
}

exports.checkIfIncludingMusic = checkIfIncludingMusic
