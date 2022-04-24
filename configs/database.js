const mongoose = require('mongoose');

// const { MONGO_URL, MONGO_DATABASE_NAME } = process.env;
// const mongoUri = `${MONGO_URL}/${MONGO_DATABASE_NAME}`;
const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DATABASE_NAME, NODE_ENV } = process.env;

// const mongoUri = 'mongodb://root:gu123451@srv-captain--mongodb:27017/watch-out-server'

let mongoUri;
if (NODE_ENV === "development") {
  mongoUri = 'mongodb://127.0.0.1:27017/watch-out-server';
}
else mongoUri = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE_NAME}`

async function connectToMongoDb() {
  const connection = await mongoose.connect(mongoUri);
  console.log("Connected to Database");
  return connection;
}

async function disconnectDb() {
  return mongoose.disconnect();
}

module.exports = {
  connectToMongoDb,
  disconnectDb
}