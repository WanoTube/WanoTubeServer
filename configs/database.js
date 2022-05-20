const mongoose = require('mongoose');
require('dotenv').config();

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE_NAME, NODE_ENV } = process.env;

let mongoUri;
if (NODE_ENV === "development" || NODE_ENV === "seeding") {
  mongoUri = 'mongodb://127.0.0.1:27017/watch-out-server';
}
else mongoUri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.upzro.mongodb.net/${MONGO_DATABASE_NAME}?retryWrites=true&w=majority`;

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