const amqp = require('amqplib');

let channel = null;

/**
 * Initialize RabbitMQ connection and channel
 */
const connectQueue = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('RabbitMQ connected and channel created.');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

/**
 * Publish a message to a queue
 * @param {string} queueName - Name of the queue
 * @param {object} message - Message to publish
 */
const publishMessage = async (queueName, message) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log(`Message published to queue ${queueName}:`, message);
  } catch (error) {
    console.error('Failed to publish message:', error);
    throw error;
  }
};

/**
 * Consume messages from a queue
 * @param {string} queueName - Name of the queue
 * @param {function} onMessage - Callback to handle the message
 */
const consumeMessage = async (queueName, onMessage) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      async (msg) => {
        if (msg !== null) {
          const messageContent = JSON.parse(msg.content.toString());
          try {
            await onMessage(messageContent);
            channel.ack(msg); // Acknowledge message processing
          } catch (err) {
            console.error('Failed to process message:', err);
            channel.nack(msg, false, false); // Reject message without requeue
          }
        }
      },
      { noAck: false }
    );

    console.log(`Consuming messages from queue ${queueName}`);
  } catch (error) {
    console.error('Failed to consume messages:', error);
    throw error;
  }
};

module.exports = {
  connectQueue,
  publishMessage,
  consumeMessage,
};