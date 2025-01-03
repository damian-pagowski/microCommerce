require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
setLogger(fastify);

const initializeMessageQueue = require('./shared/plugins/rabbitmq');
const { sendOrderConfirmationEmail } = require('./services/emailService');
const healthCheckPlugin = require('./shared/plugins/healthCheck');
const cors = require('@fastify/cors');
fastify.register(cors, {
  // TODO: use configuration file to set allowed origins
  origin: ['http://localhost:3001','http://localhost:3000', '127.0.0.1:3000' ],
  credentials: true,
});

// healthcheck route
fastify.register(healthCheckPlugin);


// Handler for processing ORDER_PAID messages
const processOrderPaidMessages = async (message) => {
  try {
    const { to, orderDetails } = message;
    fastify.log.info({ to, orderId: orderDetails.orderId }, 'Received ORDER_PAID message');
    await sendOrderConfirmationEmail(to, orderDetails);
    fastify.log.info({ to, orderId: orderDetails.orderId }, 'Email sent successfully');
  } catch (error) {
    fastify.log.error({ error: error.message }, 'Failed to send email');
  }
};

// Start the server and initialize RabbitMQ
const startEmailService = async () => {
  try {
    await initializeMessageQueue('email.queue', processOrderPaidMessages);
    await fastify.listen({ port: 3036, host: '0.0.0.0' });
    fastify.log.info('Email service is up and running on port 3036');
  } catch (error) {
    fastify.log.error({ error: error.message }, 'Failed to start email service');
    process.exit(1);
  }
};

startEmailService();