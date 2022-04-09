const amqp = require('amqplib/callback_api');
const amqpUrl = `amqp://${process.env.MQ_USERNAME}:${process.env.MQ_PASSWORD}@${process.env.MQ_HOST}:${process.env.MQ_PORT}`;

const channelPromise = new Promise((resolve, reject) => {
  amqp.connect(amqpUrl, function(err, conn) {
    if (err) {
      console.error('Error connecting to amqp', err);
      reject(err);
      return;
    }
    conn.createChannel(function(err, ch) {
      if (err) {
        console.error('Error creating amqp channel', err);
        reject(err);
        return;
      };
      resolve(ch);
    });
  });
});

module.exports = channelPromise;