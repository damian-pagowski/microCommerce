const fp = require('fastify-plugin');

const healthCheckPlugin = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    reply.send({ status: 'ok', message: 'Service is running' });
  });
};

module.exports = fp(healthCheckPlugin);