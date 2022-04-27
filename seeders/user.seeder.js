const bcrypt = require('bcryptjs');


exports.userSeeder = async function () {
  const password = '12345678';
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  return (
    [
      {
        first_name: 'Nguyen',
        last_name: 'Ngan',
        gender: 'Female',
        birth_date: new Date('12-01-2000'),
        phone_number: '123456789',
        country: 'England',
        avatar: 'https://api-private.atlassian.com/users/8f525203adb5093c5954b43a5b6420c2/avatar',
        description: 'This is Thien Ngan',
        account: {
          username: 'thienngan',
          email: 'thienngan@gmail.com',
          password: hashed,
          is_admin: false
        },
        videos: [
          {
            title: 'Big Buck Bunny',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'Elephant Dream',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'For Bigger Blazes',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'For Bigger Escape',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'For Bigger Fun',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'For Bigger Escape',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          }
        ]
      },
      {
        first_name: 'Tang',
        last_name: 'Chuong',
        gender: 'Male',
        birth_date: new Date('12-01-2000'),
        phone_number: '123456789',
        country: 'France',
        avatar: 'https://api-private.atlassian.com/users/8f525203adb5093c5954b43a5b6420c2/avatar',
        description: 'This is Khanh Chuong',
        account: {
          username: 'khanhchuong',
          email: 'khanhchuong@gmail.com',
          password: hashed,
          is_admin: true,
        },
        videos: [
          {
            title: 'For Bigger Fun',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'For Bigger Escape',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'For Bigger Fun',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          }
        ]
      },
      {
        first_name: 'Tuan',
        last_name: 'Pham',
        gender: 'Male',
        birth_date: new Date('12-01-2000'),
        phone_number: '123456789',
        country: 'Germany',
        avatar: 'https://api-private.atlassian.com/users/8f525203adb5093c5954b43a5b6420c2/avatar',
        description: 'This is Tuan Pham',
        account: {
          username: 'tuanpham',
          email: 'tuanpham@gmail.com',
          password: hashed,
          is_admin: false,
        },
        videos: [
          {
            title: 'For Bigger Escape',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          },
          {
            title: 'For Bigger Fun',
            url: 'song.mp4',
            thumbnailKey: 'thumbnail.png',
            size: 50,
            duration: 50,
            visibility: 0,
            description: 'This is test video',
          }
        ]
      }
    ]
  )
}