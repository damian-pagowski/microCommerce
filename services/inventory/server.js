require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
setLogger(fastify);
const corsPlugin = require('./shared/plugins/cors');
const mongoosePlugin = require('./shared/plugins/mongoose');
const metricsPlugin = require('./shared/plugins/metrics');
const initializeMessageQueue = require('./shared/plugins/rabbitmq');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { processInventoryMessage } = require('./services/inventoryService');
const healthCheckPlugin = require('./shared/plugins/healthCheck');

const PORT = process.env.PORT || 3031;

// Register shared plugins
fastify.register(corsPlugin);
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