const { getAllProducts, getProductById } = require('../services/productService');
const { ValidationError } = require('../utils/errors');

async function productRoutes(fastify, opts) {
  fastify.get('/products', async (req, reply) => {
    const products = await getAllProducts();
    reply.status(200).send(products);
  });

  fastify.get('/products/:id', async (req, reply) => {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError('Product ID is required');
    }
    const product = await getProductById(id);
    reply.status(200).send(product);
  });
}

module.exports = productRoutes;