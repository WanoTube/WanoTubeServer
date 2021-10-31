require('dotenv').config()
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
    region, 
    accessKeyId,
    secretAccessKey
})

// uploads a file to s3
function uploadFile(files){
    console.log(files.video)
    // Binary data base64
    const fileStream  = Buffer.from(files.video.data, 'binary');
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: files.video.name
    }
    return s3.upload(uploadParams).promise()
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

function getFile(fileKey){
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }
    return s3.getObject(downloadParams)
}
exports.getFile = getFile

