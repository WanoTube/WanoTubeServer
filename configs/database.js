const mongoose = require('mongoose');

const { MONGO_URL, MONGO_DATABASE_NAME } = process.env;
const mongoUri = `${MONGO_URL}/${MONGO_DATABASE_NAME}`;

async function connectToMongoDb() {
  const connection = await mongoose.connect(mongoUri);
  console.log("Connected to Database");
  return connection;
}

module.exports = {
  connectToMongoDb
}