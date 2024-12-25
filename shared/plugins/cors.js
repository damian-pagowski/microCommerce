

async function cors(fastify, options) {
    await fastify.register(require('@fastify/cors'), {
      origin: '*', 
    });
  }
  
  module.exports = cors;