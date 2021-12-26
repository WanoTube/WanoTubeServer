const mongoose = require('mongoose');
const { Role } = require('./role.js')
mongoose.connect('mongodb://127.0.0.1:27017/watch-out-server')

// let admin = new Role({ _id: new mongoose.mongo.ObjectId("61c835841cf23b3200a016e8"), role_name: 'admin' });
// let user = new Role({ _id: new mongoose.mongo.ObjectId("61c835841cf23b3200a016e9"), role_name: 'user' });

// (async () => {
//     await Role.create(admin, user);
// })();
