const { createOrder, getOrderById, getOrderHistoryByUsername } = require('../services/orderService');
const { createOrderSchema, orderIdSchema } = require('../validation/orderValidation');
const { ValidationError } = require('../shared/utils/errors');

module.exports = async function (fastify, opts) {
  fastify.post('/orders', {
    preHandler: [fastify.authenticate, async (req) => {
      const { error } = createOrderSchema.validate(req.body);
      if (error) {
        throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
      }
    }],
  }, async (req, reply) => {
    const { items } = req.body;
    const user = req.user;

    const order = await createOrder(user, items);
    reply.status(201).send({ success: true, order });
  });

  fastify.get('/orders/:id', {
    preHandler: [fastify.authenticate, async (req) => {
      const { error } = orderIdSchema.validate(req.params);
      if (error) {
        throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
      }
    }],
  }, async (req, reply) => {
    const { id } = req.params;
    const order = await getOrderById(id, req.user.username);
    reply.status(200).send({ success: true, order });
  });

  fastify.get('/orders', {
    preHandler: [fastify.authenticate],
  }, async (req, reply) => {
    const orders = await getOrderHistoryByUsername(req.user.username);
    reply.status(200).send({ success: true, orders });
  });
};
