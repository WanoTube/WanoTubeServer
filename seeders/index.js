const { connectToMongoDb, disconnectDb } = require('../configs/database')
const Account = require('../models/account');
const User = require('../models/user');
const { Video } = require('../models/video');

const { userSeeder } = require('./user.seeder');

const seedUser = async function () {
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
      const { title, url, size, description, duration } = video;
      await Video.create({
        title,
        url,
        size,
        duration,
        description,
        author_id: createdUser._id
      });
    }
  }
}

const seed = async function () {
  await connectToMongoDb();
  await seedUser();
  await disconnectDb();
}

seed();