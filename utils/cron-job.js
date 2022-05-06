const cron = require('node-cron');

exports.task = cron.schedule('* * * * * *', () => {
  console.log('stopped task');
}, {
  scheduled: false
});