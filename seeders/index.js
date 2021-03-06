const { connectToMongoDb, disconnectDb } = require('../configs/database');
const Account = require('../models/account');
const User = require('../models/user');
const Video = require('../models/video');
require('dotenv').config();

const { userSeeder } = require('./user.seeder');

const seedData = async function () {
  const users = await userSeeder();
  for (let user of users) {
    const {
      first_name, last_name, gender, birth_date, phone_number, country, avatar,
      account, videos
    } = user;
    const { username, email, password, is_admin } = account;

    const createdUser = await User.create({
      first_name,
      last_name,
      gender,
      birth_date,
      phone_number,
      country,
      avatar
    });

    await Account.create({
      username,
      email,
      password,
      is_admin,
      user_id: createdUser._id
    });

    for (let video of videos) {
      const { title, key, thumbnail_key, manifest_key,
        size, description, duration, status,
        visibility, total_likes, total_views, tags, type
      } = video;
      await Video.create({
        title, video_key: key, thumbnail_key, manifest_key,
        autogenerated_thumbnails_key: [thumbnail_key, thumbnail_key, thumbnail_key],
        size, duration, description, tags, type,
        visibility, author_id: createdUser._id,
        total_likes, total_views, status
      });
    }
  }
  console.log("Data seeded!");
}

const seed = async function () {
  await connectToMongoDb();
  await seedData();
  await disconnectDb();
}
if (process.env.NODE_ENV === "seeding") seed();

module.exports = seedData;