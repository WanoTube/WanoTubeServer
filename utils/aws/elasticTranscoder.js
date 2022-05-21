//Create a S3 object and configure it as per credentials
const AWS = require('aws-sdk')

const {
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_BUCKET_ACCESS_KEY_ID,
  AWS_BUCKET_SECRET_ACCESS_KEY,
  AWS_ELASTIC_TRANSCODER_PIPELINE_ID
} = process.env;

//Create a object that contains access keys
const credentials = {
  accessKeyId: AWS_BUCKET_ACCESS_KEY_ID,
  secretAccessKey: AWS_BUCKET_SECRET_ACCESS_KEY
}

//Create an Object to start the transcoding Job.
const elastictranscoder = new AWS.ElasticTranscoder({
  apiVersion: '2012-09-25',
  region: AWS_BUCKET_REGION, //Bucket Region
  credentials: credentials,
  videoBucket: AWS_BUCKET_NAME
})

const createJob = async (srcKey) => {
  //Create a JSON object to be passed as parameter
  var newKey = srcKey.split('.')[0];
  const params = {
    PipelineId: AWS_ELASTIC_TRANSCODER_PIPELINE_ID, //PipelineId of Elastic transcoder
    OutputKeyPrefix: 'output/',
    Input: {
      Key: srcKey,  //Source path of video 
      FrameRate: 'auto',
      Resolution: 'auto',
      AspectRatio: 'auto',
      Interlaced: 'auto',
      Container: 'auto'
    },
    Outputs: [
      {
        Key: newKey + '.ts',
        ThumbnailPattern: '',
        PresetId: '1351620000001-200040', //HLS v3 2mb/s
        SegmentDuration: '10', //Duration in segment on which transcoding is done as we chose HLS streaming
        ThumbnailPattern: 'poster-{count}', //It is used to create snapshot of Video
      }],
    // Playlist: [{
    //   Format: 'HLSv3',
    //   Name: newKey + '.m3u8',
    //   OutputKeys: [
    //     newKey + '.ts'
    //   ]
    // }]
  }

  //To create a new Job
  elastictranscoder.waitFor('jobComplete', params, function (err, data) {
    if (err) console.log("Error nef"); // an error occurred
    else console.log("data", data);           // successful response
  });

  return new Promise((resolve, reject) => {
    elastictranscoder.createJob(params, function (err, data) {
      if (err) {
        reject(err.message);
      }
      else {
        resolve(data);
      }
    });
  })
}

module.exports = {
  createJob
}