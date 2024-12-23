const fastifyPlugin = require('fastify-plugin');
const { getAllProducts, getProductById } = require('../services/productService');
const { productIdSchema } = require('../validation/productValidation');

async function productRoutes(fastify, opts) {
  fastify.get('/products', async (req, reply) => {
    const products = await getAllProducts();
    reply.status(200).send(products);
  });

  fastify.get('/products/:id', {
    preValidation: async (req) => {
      const { error } = productIdSchema.validate(req.params);
      if (error) {
        throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
      }
    },
  }, async (req, reply) => {
    const { id } = req.params;
    const product = await getProductById(id);
    reply.status(200).send(product);
  });
}

module.exports = fastifyPlugin(productRoutes);