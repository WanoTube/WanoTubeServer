const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const {
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_BUCKET_ACCESS_KEY_ID,
  AWS_BUCKET_SECRET_ACCESS_KEY,
  AWS_ELASTIC_TRANSCODER_PIPELINE_ID
} = process.env;

const credentials = {
  accessKeyId: AWS_BUCKET_ACCESS_KEY_ID,
  secretAccessKey: AWS_BUCKET_SECRET_ACCESS_KEY
}

const elastictranscoder = new AWS.ElasticTranscoder({
  apiVersion: '2012-09-25',
  region: AWS_BUCKET_REGION, //Bucket Region
  credentials: credentials,
  videoBucket: AWS_BUCKET_NAME
})

const createJob = async (srcKey) => {
  const newKey = srcKey.split('/')[srcKey.split('/').length - 1].split('.')[0];
  const id = uuidv4();
  const params = {
    PipelineId: AWS_ELASTIC_TRANSCODER_PIPELINE_ID,
    OutputKeyPrefix: `output/${newKey}-${id}/`,
    Input: {
      Key: srcKey,
      FrameRate: 'auto',
      Resolution: 'auto',
      AspectRatio: 'auto',
      Interlaced: 'auto',
      Container: 'auto'
    },
    Playlists: [{
      Format: 'HLSv3',
      Name: 'main',
      OutputKeys: [
        '2M/',
        '1M5/',
        '1M/',
        '600k/',
        '400k/'
      ]
    }],
    Outputs: [
      {
        SegmentDuration: '10', //Duration in segment on which transcoding is done as we chose HLS streaming
        Key: '2M/',
        ThumbnailPattern: '',
        PresetId: '1351620000001-200010', //HLS v3 (Apple HTTP Live Streaming), 1 megabit/second
      },
      {
        SegmentDuration: '10', //Duration in segment on which transcoding is done as we chose HLS streaming
        Key: '1M5/',
        ThumbnailPattern: '',
        PresetId: '1351620000001-200020', //HLS v3 (Apple HTTP Live Streaming), 1 megabit/second
      },
      {
        SegmentDuration: '10', //Duration in segment on which transcoding is done as we chose HLS streaming
        Key: '1M/',
        ThumbnailPattern: '',
        PresetId: '1351620000001-200030', //HLS v3 (Apple HTTP Live Streaming), 1 megabit/second
      },
      {
        SegmentDuration: '10', //Duration in segment on which transcoding is done as we chose HLS streaming
        Key: '600k/',
        ThumbnailPattern: '',
        PresetId: '1351620000001-200040', //HLS v3 (Apple HTTP Live Streaming), 600 kilobits/second
      },
      {
        SegmentDuration: '10', //Duration in segment on which transcoding is done as we chose HLS streaming
        Key: '400k/',
        ThumbnailPattern: '',
        PresetId: '1351620000001-200050', //HLS v3 (Apple HTTP Live Streaming), 400 kilobits/second
      },
    ],
  }
  return new Promise((resolve, reject) => {
    elastictranscoder.createJob(params, function (err, data) {
      if (err) reject(err);
      else {
        const jobParams = {
          Id: data.Job.Id /* required */
        };
        elastictranscoder.waitFor('jobComplete', jobParams, function (err, data) {
          if (err) reject(err);
          else resolve({ manifestKey: data.Job.OutputKeyPrefix + 'main.m3u8' });
        });
      }
    });
  })
}

module.exports = {
  createJob
}