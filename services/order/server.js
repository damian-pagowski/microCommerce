require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
setLogger(fastify);

const mongoosePlugin = require('./shared/plugins/mongoose');
const metricsPlugin = require('./shared/plugins/metrics');
const jwtPlugin = require('./shared/plugins/jwt');
const initializeMessageQueue = require('./shared/plugins/rabbitmq');
const orderRoutes = require('./routes/orderRoutes');
const { processOrderMessages, processPaymentMessages } = require('./services/orderService');
const healthCheckPlugin = require('./shared/plugins/healthCheck');

const PORT = process.env.PORT || 3032;

const cors = require('@fastify/cors');
fastify.register(cors, {
  // TODO: use configuration file to set allowed origins
  origin: ['http://localhost:3001','http://localhost:3000', '127.0.0.1:3000' ],
  credentials: true,
});

// Register shared plugins
fastify.register(mongoosePlugin);
fastify.register(metricsPlugin);
fastify.register(jwtPlugin); 
fastify.register(healthCheckPlugin);

// Register order routes
fastify.register(orderRoutes);

// Initialize RabbitMQ queues
const initializeQueues = async () => {
  await initializeMessageQueue('payments.queue', processPaymentMessages);
  await initializeMessageQueue('orders.queue', processOrderMessages);
};

// Start the server
const startServer = async () => {
  try {
    // Initialize RabbitMQ
    await initializeQueues();
    // Start the Fastify server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.fatal('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();