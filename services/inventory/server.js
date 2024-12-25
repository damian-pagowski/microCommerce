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
const corsPlugin = require('./shared/plugins/cors');
const mongoosePlugin = require('./shared/plugins/mongoose');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { connectQueue, consumeMessage } = require('./shared/queues/queueService');
const { processInventoryMessage } = require('./services/inventoryService');
const PORT = process.env.PORT || 3031;
// logger
const logger = getLogger();

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const response = {
    statusCode,
    message: error.message || 'An unexpected error occurred',
  };
  if (error.fields) {
    response.details = error.fields;
  }
  logger.error(error);
  reply.status(statusCode).send(response);
});
fastify.register(corsPlugin);
fastify.register(mongoosePlugin);
// Register Routes
fastify.register(inventoryRoutes);
fastify.get('/', async (request, reply) => {
  reply.send({ status: 'ok', message: 'Service is running' });
});

// Start Server
const startServer = async () => {
  try {
    // Connect to RabbitMQ and consume messages
    await connectQueue();
    logger.info('RabbitMQ connected.');
    await consumeMessage('inventory.queue', processInventoryMessage);
    // Start the Fastify server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();