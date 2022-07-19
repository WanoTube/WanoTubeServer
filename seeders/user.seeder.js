const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const { randomIntNumber } = require('../utils/number');
const { VideoTag, VideoType } = require('../constants/video');

const DEFAULT_MANIFEST_KEY = 'output/ando_trungquoc_6289cc81aae1a24c9658cd21_1653201384-827f7cfc-b611-479c-a4b9-4f06bbeaace3/main.m3u8';

const randomElementInArray = function (items, numberOfItems = 1) {
  const tempItems = [...items];
  tempItems.sort(() => Math.random() - 0.5);
  return tempItems.slice(0, numberOfItems);
}

const thumbnailList = [
  'ando-trungquoc.png',
  'begin-song.png',
  'kingdomrush.png',
  'real-vs-mc.png',
  'song.png'
]

const videoList = [
  'ando-trungquoc1.mp4',
  'ando-trungquoc.mp4',
  'begin-song.mp4',
  'kingdomrush.mp4',
  'real-vs-mc.mp4',
  'song.mp4'
]

const videoTagList = [
  'EDUCATION',
  'MUSIC',
  'GAME',
  'SPORT',
  'MUSIC'
]

const shortThumbnailList = [
  'bfzy_otp.png',
  'brilliant_clock.png',
  'nhaxx_xx.png',
  'zky.png'
]

const shortVideoList = [
  'bfzy_otp.mp4',
  'brilliant_clock.mp4',
  'nhaxx_xx.mp4',
  'zky.mp4'
]


generateVideoTitle = function () {
  const random = Math.floor(Math.random() * 10);
  switch (random) {
    case 0: return faker.animal.cat();
    case 1: return faker.company.companyName();
    case 2: return faker.commerce.productName();
    case 3: return faker.name.jobArea();
    case 4: return faker.animal.bird();
    case 5: return faker.commerce.department();
    case 6: return faker.internet.userName();
    case 7: return faker.address.country();
    case 8: return faker.animal.insect();
    default: return faker.music.genre()
  }
}

exports.userSeeder = async function () {
  const password = '12345678';
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const accounts = [];
  for (let i = 0; i < 10; i++) {
    const first_name = faker.name.firstName();
    const last_name = faker.name.lastName();
    const gender = faker.name.gender();
    const birth_date = faker.date.past();
    const phone_number = faker.phone.phoneNumber();
    const country = faker.address.country();
    const avatar = faker.image.avatar();
    const description = faker.lorem.paragraph();
    const username = faker.internet.userName();
    const email = `user${i}@gmail.com`;
    const is_admin = !(i % 4);
    const videos = [];
    for (let j = 0; j < 15; j++) {
      const video = generateVideo(j, videoList, thumbnailList, VideoType.NORMAL);
      const shortVideo = generateVideo(j, shortVideoList, shortThumbnailList, VideoType.SHORT);
      videos.push(video);
      videos.push(shortVideo);
    }

    const account = {
      first_name,
      last_name,
      gender,
      birth_date,
      phone_number,
      country,
      avatar,
      description,
      account: {
        username,
        email,
        password: hashed,
        is_admin,
      },
      videos
    };
    accounts.push(account);
  }
  return accounts;
}

function generateVideo(index, videos, thumbnailList, type) {
  const title = generateVideoTitle();
  const random = Math.floor(Math.random() * videos.length);
  const key = videos[random];
  const thumbnail_key = thumbnailList[random];
  const size = 50;
  const duration = 50;
  const visibility = !!(index % 4);
  const description = faker.lorem.paragraph();
  const total_likes = randomIntNumber();
  const total_views = randomIntNumber();
  const tags = videoTagList[random];
  const manifest_key = DEFAULT_MANIFEST_KEY;
  const status = "COMPLETED";
  const video = {
    title, key, thumbnail_key, manifest_key,
    size, duration, visibility,
    total_likes, total_views,
    description, tags, type, status
  };
  return video;
}