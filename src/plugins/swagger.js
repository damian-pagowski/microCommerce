async function swagger(fastify, options) {
    await fastify.register(require('@fastify/swagger'), {
      routePrefix: '/docs',
      swagger: {
        info: {
          title: 'Microservice API',
          description: 'API Documentation',
          version: '1.0.0',
        },
      },
      exposeRoute: true,
    });
  }
  
  module.exports = swagger;