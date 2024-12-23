const fastifyPlugin = require('fastify-plugin');
const { getInventoryByProductId } = require('../services/inventoryService');
const { productIdSchema } = require('../validation/inventoryValidation');
const { ValidationError } = require('../utils/errors');

async function inventoryRoutes(fastify, opts) {
  fastify.get('/inventory/:productId', {
    preHandler: async (req) => {
      const { error } = productIdSchema.validate(req.params);
      if (error) {
        throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
      }
    },
  }, async (request, reply) => {
    const { productId } = request.params;
    const inventory = await getInventoryByProductId(productId);
    reply.status(200).send(inventory);
  });
}

module.exports = fastifyPlugin(inventoryRoutes);