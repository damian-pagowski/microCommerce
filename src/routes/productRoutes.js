const { getAllProducts, getProductById } = require('../services/productService');
const { NotFoundError } = require('../utils/errors');

async function productRoutes(fastify, opts) {
    fastify.get('/products', async (request, reply) => {
        const products = await getAllProducts();
        reply.status(200).send(products);
    });

    fastify.get('/products/:id', async (request, reply) => {
        const { id } = request.params;
        const product = await getProductById(id);
        if (!product) {
            throw new NotFoundError('Product', id);
        }
        reply.status(200).send(product);
    });
}

module.exports = productRoutes;