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
    signature: signature,
    sample_bytes: data.length,
    timestamp: timestamp,
  }
  request.post({
    url: "http://" + options.host + options.endpoint,
    method: 'POST',
    formData: formData
  }, cb);
}

function audioRecognition(data) {
  return new Promise(function (resolve, reject) {
    try {
      identify(Buffer.from(data), defaultOptions, function (err, httpResponse, body) {
        if (err) console.log(err);
        else {
          const result = JSON.parse(body);
          if (result) {
            if (result.status.msg == "Success") {
              const data = result.metadata
              const musics = JSON.parse(JSON.stringify(data.music)) // array
              resolve(musics)
            } else {
              console.log("Recognition does not success: " + result.status.msg);
              resolve(null);
            }
          } else {
            console.log("Cannot recognize music");
            resolve(null);
          }
        }
      });
    } catch (error) {
      console.log(error)
      resolve(null)
    }
  })

}

exports.audioRecognition = audioRecognition

function musicIncluded(musics) {
  const first = musics[0]
  const title = first.title
  const album = first.album.name
  const artists = first.artists // array
  const songArtist = artists[0].name

  const jsonResult = { title, album, songArtist }
  console.log("audioRecognition result: " + JSON.stringify(jsonResult))
  return jsonResult
}

exports.musicIncluded = musicIncluded
