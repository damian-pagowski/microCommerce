require('dotenv').config();
const fastify = require('fastify')({ logger: true });


const startServer = async () => {
  try {
    // Register plugins
    await fastify.register(require('./src/plugins/cors'));
    await fastify.register(require('./src/plugins/swagger'));
    await fastify.register(require('./src/plugins/mongoose'));
    await fastify.register(require('./src/queues/rabbitmq'));
 
    // Register routes
    await fastify.register(require('./src/routes/sampleRoute'), { prefix: '/api' });

    // Start server
    await fastify.listen({ port: process.env.PORT || 3000 });
    fastify.log.info(`Server is running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();