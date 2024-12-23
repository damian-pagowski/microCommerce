const { getInventoryByProductId } = require('../services/inventoryService');

async function inventoryRoutes(fastify, opts) {
  fastify.get('/inventory/:productId', async (request, reply) => {
    const { productId } = request.params;
    const inventory = await getInventoryByProductId(productId);
    reply.status(200).send(inventory);
  });
}

module.exports = inventoryRoutes;