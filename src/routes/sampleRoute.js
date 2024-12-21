async function sampleRoute(fastify, options) {
    fastify.get('/sample', async (request, reply) => {
      return { message: 'Hello, World!' };
    });
  }
  
  module.exports = sampleRoute;