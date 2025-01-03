require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
setLogger(fastify);
const mongoosePlugin = require('./shared/plugins/mongoose');
const metricsPlugin = require('./shared/plugins/metrics');
const initializeMessageQueue = require('./shared/plugins/rabbitmq');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { processInventoryMessage } = require('./services/inventoryService');
const healthCheckPlugin = require('./shared/plugins/healthCheck');

const PORT = process.env.PORT || 3031;

const cors = require('@fastify/cors');
fastify.register(cors, {
  // TODO: use configuration file to set allowed origins
  origin: ['http://localhost:3001','http://localhost:3000', '127.0.0.1:3000' ],
  credentials: true,
});

// Register shared plugins
fastify.register(mongoosePlugin);
fastify.register(metricsPlugin);

// Register inventory routes
fastify.register(inventoryRoutes);

// healthcheck route
fastify.register(healthCheckPlugin);

// Start the server and initialize RabbitMQ
const startServer = async () => {
  try {
    // Initialize RabbitMQ and consume inventory messages
    await initializeMessageQueue('inventory.queue', processInventoryMessage);

    // Start the Fastify server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server is running at http://localhost:${PORT}`);
  } catch (error) {
    fastify.log.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();