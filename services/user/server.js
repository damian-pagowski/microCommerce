require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
setLogger(fastify);

// Plugins
const mongoosePlugin = require('./shared/plugins/mongoose');
const jwtPlugin = require('./shared/plugins/jwt');
const metricsPlugin = require('./shared/plugins/metrics');
const healthCheckPlugin = require('./shared/plugins/healthCheck');
const cors = require('@fastify/cors');
fastify.register(cors, {
  // TODO: use configuration file to set allowed origins
  origin: ['http://localhost:3001','http://localhost:3000', '127.0.0.1:3000' ],
  credentials: true,
});

// Routes
const userRoutes = require('./routes/userRoutes');

// Register Plugins
fastify.register(mongoosePlugin);
fastify.register(jwtPlugin);
fastify.register(metricsPlugin);
fastify.register(healthCheckPlugin);

// Register Routes
fastify.register(userRoutes);

// Start Server
const startServer = async () => {
  try {   
    await fastify.listen({ port: process.env.PORT || 3035, host: '0.0.0.0' });
    fastify.log.info(`Server is running at http://localhost:${process.env.PORT || 3035}`);
  } catch (err) {
    fastify.log.fatal('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();