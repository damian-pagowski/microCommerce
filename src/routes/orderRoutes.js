const { createOrder, getOrderById } = require('../services/orderService');

module.exports = async function (fastify, opts) {
  fastify.post('/orders', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const { items } = req.body;
      const username = req.user.username;

      const order = await createOrder(username, items);
      reply.status(201).send({ success: true, order });
    } catch (error) {
      reply.status(error.statusCode || 500).send({ message: error.message });
    }
  });


  fastify.get('/orders/:id', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const { id } = req.params;
      const order = await getOrderById(id, req.user.username);

      if (!order) {
        return reply.status(404).send({ message: 'Order not found' });
      }

      reply.status(200).send({ success: true, order });
    } catch (error) {
      reply.status(error.statusCode || 500).send({ message: error.message });
    }
  });
};