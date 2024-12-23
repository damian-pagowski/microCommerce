const fastifyPlugin = require('fastify-plugin');
const { processPayment } = require('../services/paymentService');
const { paymentSchema } = require('../validation/paymentValidation');
const { ValidationError } = require('../utils/errors');

async function paymentRoutes(fastify, options) {
  fastify.post('/payments', {
    preValidation: async (req) => {
      const { error } = paymentSchema.validate(req.body);
      if (error) {
        throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
      }
    },
  }, async (req, reply) => {
    const { orderId, amount, currency, cardDetails } = req.body;
    const result = await processPayment({ orderId, amount, currency, cardDetails });
    reply.status(200).send(result);
  });
}

module.exports = fastifyPlugin(paymentRoutes);