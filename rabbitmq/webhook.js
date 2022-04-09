const channelPromise = require('./channel');

const webhookQueueName = process.env.WEB_HOOK;

const handleWebHook = msg => {

}

(async () => {
  try {
    return channelPromise.then(async ch => {
      console.log("Waiting for messages in %s.", webhookQueueName);
      ch.assertQueue(webhookQueueName);
      ch.prefetch(5);
      ch.consume(webhookQueueName, async (msg) => {
        try {
          let message = JSON.parse(msg.content);
          console.log('msg_queue', {message})
          //async
          await handleWebHook(message)
        } catch (err) {
          console.log('err', {err: err.stack})
        }
        ch.ack(msg)
      }, {noAck: false})
    })
  } catch(err) {
    console.error('Error establish amqp channel', {err: err.stack});
  }
})()