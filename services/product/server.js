require('dotenv').config();
const getLoggerConfig = require('./shared/utils/loggerConfig');
const fastify = require('fastify')({
  logger: getLoggerConfig()
});
const { setLogger } = require('./shared/utils/logger');
setLogger(fastify);
const mongoosePlugin = require('./shared/plugins/mongoose');
const metricsPlugin = require('./shared/plugins/metrics');
const productRoutes = require('./routes/productRoutes');
const healthCheckPlugin = require('./shared/plugins/healthCheck');
const jwtPlugin = require('./shared/plugins/jwt');
const PORT = process.env.PORT || 3034;
const cors = require('@fastify/cors');

fastify.register(cors, {
  // TODO: use configuration file to set allowed origins
  origin: ['http://localhost:3001','http://localhost:3000', '127.0.0.1:3000' ],
  credentials: true,
});

// Register shared plugins
fastify.register(mongoosePlugin);
fastify.register(metricsPlugin);
fastify.register(healthCheckPlugin);
fastify.register(jwtPlugin); 

// Register product routes
fastify.register(productRoutes);

fastify.addHook('onResponse', async (request, reply) => {
  console.log('Response headers:', reply.getHeaders());
});

// Start the server
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