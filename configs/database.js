const mongoose = require('mongoose');

const { MONGO_URL, MONGO_DATABASE_NAME } = process.env;
// const mongoUri = `${MONGO_URL}/${MONGO_DATABASE_NAME}`;

const mongoUri = 'mongodb://127.0.0.1:27017/watch-out-server';

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