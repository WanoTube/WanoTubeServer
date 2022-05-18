const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const { randomIntNumber } = require('../utils/number');
const { VideoTag, VideoType } = require('../constants/video');

const randomElementInArray = function (items) {
  return items[items.length * Math.random() | 0];
}

const thumbnailList = [
  'book.png',
  'cat.png',
  'chelseavsliverpool.png',
  'dtck.png',
  'foucs.png',
  'game.png',
  'harry-kane-vuot-mat-salah-trong-cuoc-tranh-gianh-vua-pha-luoi-3.png',
  'kingdomrush.png',
  'liver-spurs.png',
  'liverpool-son-heung-min.png',
  'mern.png',
  'naruto.png',
  'thanhpalm.png',
  'thumbnail.png',
  'tomandjerry.png',
  'bfzy_otp.png',
  'brilliant_clock.png',
  'nhaxx_xx.png'
]

const videoList = [
  'ando-trungquoc.mp4',
  'begin-song.mp4',
  'cambongfa.mp4',
  'kingdomrush.mp4',
  'real-vs-mc.mp4',
  'song.mp4',
  'titanic-my-heart-will-go-on.mp4'
]

const shortVideoList = [
  'bfzy_otp.mp4',
  'brilliant_clock.mp4',
  'nhaxx_xx.mp4'
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
  for (let i = 0; i < 20; i++) {
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
    for (let j = 0; j < 20; j++) {
      const video = addVideo(j, videoList);
      const shortVideo = addVideo(j, shortVideoList, VideoType.SHORT);
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

function addVideo(index, videos, type) {
  const title = generateVideoTitle();
  const key = randomElementInArray(videos);
  const thumbnail_key = randomElementInArray(thumbnailList);
  const size = 50;
  const duration = 50;
  const visibility = !!(index % 4);
  const description = faker.lorem.paragraph();
  const total_likes = randomIntNumber();
  const total_views = randomIntNumber();
  const tags = ["", ""].map(() => randomElementInArray(Object.values(VideoTag)));
  const video = {
    title, key, thumbnail_key,
    size, duration, visibility,
    total_likes, total_views,
    description, tags, type
  };
  console.log(video)
  return video;
}