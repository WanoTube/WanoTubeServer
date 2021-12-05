require('dotenv').config()
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
    region, 
    accessKeyId,
    secretAccessKey
});

// uploads a file to s3
function uploadFile(newFilePath){
    // Binary data base64
    const newFileBuffer = fs.readFileSync(newFilePath);
    const { base } = path.parse(newFilePath);
    const fileName = base;
    const fileStream  = Buffer.from(newFileBuffer, 'binary');
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: fileName
    };
    return s3.upload(uploadParams, function(err, data) {
        if (err) {
            console.log('There was an error uploading your file: ', err);
            return false;
          }
          console.log('Successfully uploaded file.', data);
          return true;
    });
}
exports.uploadFile = uploadFile

// downloads a file from s3
function getFileStream(fileKey){
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }
    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream