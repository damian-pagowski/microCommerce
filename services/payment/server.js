require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
const corsPlugin = require('./shared/plugins/cors');
const mongoosePlugin = require('./shared/plugins/mongoose');
const metricsPlugin = require('./shared/plugins/metrics');
const jwtPlugin = require('./shared/plugins/jwt');
const initializeMessageQueue = require('./shared/plugins/rabbitmq');
const paymentRoutes = require('./routes/paymentRoutes');
const healthCheckPlugin = require('./shared/plugins/healthCheck');

const PORT = process.env.PORT || 3033;

// Set up logging
setLogger(fastify);

// Register shared plugins
fastify.register(corsPlugin);
fastify.register(mongoosePlugin);
fastify.register(metricsPlugin);
fastify.register(jwtPlugin); 

// healthcheck route
fastify.register(healthCheckPlugin);

// Register payment routes
fastify.register(paymentRoutes);

// Start the server
const startServer = async () => {
  try {
    await initializeMessageQueue('payments.queue', null);
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.fatal('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();