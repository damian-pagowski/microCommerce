const { connectQueue, consumeMessage } = require('../queues/queueService');
const { getLogger } = require('../utils/logger');

const initializeMessageQueue = async (queueName, messageHandler) => {
  const logger = getLogger();
  try {
    await connectQueue();
    logger.info('RabbitMQ connected.');
    await consumeMessage(queueName, messageHandler);
    logger.info(`Listening for messages on ${queueName}`);
  } catch (error) {
    logger.error({ error: error.message }, `Failed to initialize message queue for ${queueName}`);
    process.exit(1);
  }
};

module.exports = initializeMessageQueue;