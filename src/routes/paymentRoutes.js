const fastifyPlugin = require('fastify-plugin');
const { processPayment } = require('../services/paymentService');

async function paymentRoutes(fastify, options) {
  fastify.post('/payments', async (req, reply) => {
    try {
      const { orderId, amount, currency, cardDetails } = req.body;

      if (!orderId || !amount || !currency || !cardDetails) {
        return reply.status(400).send({ message: 'Missing required fields' });
      }

      const result = await processPayment({ orderId, amount, currency, cardDetails });

      if (result.status === 'rejected') {
        return reply.status(402).send({ message: 'Payment failed', reason: result.reason });
      }

      reply.status(200).send(result);
    } catch (error) {
      req.log.error('Error processing payment:', error);
      reply.status(500).send({ message: 'Internal Server Error' });
    }
  });
}

module.exports = fastifyPlugin(paymentRoutes);