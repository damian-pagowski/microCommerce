require('dotenv').config();
const fastify = require('fastify')({
  logger:
    process.env.NODE_ENV === 'production'
      ? true 
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        },
});
const { setLogger, getLogger } = require('./shared/utils/logger');
setLogger(fastify);
const logger = getLogger();

const { connectQueue, consumeMessage } = require('./shared/queues/queueService');
const { sendOrderConfirmationEmail } = require('./services/emailService');

// Handler for processing ORDER_PAID messages
const processOrderPaidMessages = async (message) => {
    try {
        const { to, orderDetails } = message;

        logger.info({ to, orderId: orderDetails.orderId }, 'Received ORDER_PAID message');

        await sendOrderConfirmationEmail(to, orderDetails);

        logger.info({ to, orderId: orderDetails.orderId }, 'Email sent successfully');
    } catch (error) {
        logger.error({ error: error.message }, 'Failed to send email');
    }
};

// Connect to RabbitMQ and start consuming messages
const initializeMessageQueue = async () => {
    try {
        await connectQueue();
        logger.info('RabbitMQ connected.');

        await consumeMessage('email.queue', processOrderPaidMessages);
        logger.info('Listening for messages on email.queue');
    } catch (error) {
        logger.error({ error: error.message }, 'Failed to initialize message queue');
        process.exit(1);
    }
};

// Health check route
fastify.get('/', async (request, reply) => {
    reply.send({ status: 'Email service is running' });
});

// Start the HTTP server
const startServer = async () => {
    try {
        await fastify.listen({ port: 3036, host: '0.0.0.0' });
        logger.info('Email service is up and running on port 3036');
    } catch (error) {
        logger.error({ error: error.message }, 'Failed to start the server');
        process.exit(1);
    }
};

// Initialize the service
const startEmailService = async () => {
    await initializeMessageQueue();
    await startServer();
};

startEmailService();