require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
setLogger(fastify);

const mongoosePlugin = require('./shared/plugins/mongoose');
const jwtPlugin = require('./shared/plugins/jwt');
const healthCheckPlugin = require('./shared/plugins/healthCheck');
const metricsPlugin = require('./shared/plugins/metrics');
const reviewRoutes = require('./routes/reviewRoutes');

const PORT = process.env.PORT || 3037;
const cors = require('@fastify/cors');
fastify.register(cors, {
  // TODO: use configuration file to set allowed origins
  origin: ['http://localhost:3001','http://localhost:3000', '127.0.0.1:3000' ],
  credentials: true,
});
// Register Plugins
fastify.register(mongoosePlugin);
fastify.register(jwtPlugin);
fastify.register(healthCheckPlugin);
fastify.register(metricsPlugin);

// Register Routes
fastify.register(reviewRoutes);

// Start Server
const startServer = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.fatal('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();