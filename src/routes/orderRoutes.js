const { createOrder, getOrderById } = require('../services/orderService');
const { createOrderSchema, orderIdSchema } = require('../validation/orderValidation');
const { ValidationError } = require('../utils/errors');

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
    const username = req.user.username;

    const order = await createOrder(username, items);
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
};
