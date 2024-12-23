const fastifyPlugin = require('fastify-plugin');
const { processPayment } = require('../services/paymentService');
const { ValidationError } = require('../utils/errors');

async function paymentRoutes(fastify, options) {
  fastify.post('/payments', async (req, reply) => {
    const { orderId, amount, currency, cardDetails } = req.body;
    if (!orderId || !amount || !currency || !cardDetails) {
      throw new ValidationError('Missing required fields in payment request', ['orderId', 'amount', 'currency', 'cardDetails']);
    }
    const result = await processPayment({ orderId, amount, currency, cardDetails });
    reply.status(200).send(result);
  });
}

module.exports = fastifyPlugin(paymentRoutes);