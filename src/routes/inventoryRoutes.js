const { getInventoryByProductId } = require('../services/inventoryService');
const { NotFoundError } = require('../utils/errors');

async function inventoryRoutes(fastify, opts) {
    fastify.get('/inventory/:productId', async (request, reply) => {
        const { productId } = request.params;
        const inventory = await getInventoryByProductId(productId);
        if (!inventory) {
            throw new NotFoundError('Inventory', productId);
        }
        reply.status(200).send(inventory);
    });
}

module.exports = inventoryRoutes;