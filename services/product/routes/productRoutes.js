const fastifyPlugin = require('fastify-plugin');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../services/productService');
const {
  productIdSchema,
  productCreateSchema,
  productUpdateSchema
} = require('../validation/productValidation');
const { ValidationError } = require('../shared/utils/errors');
const authorizeRoles = require('../shared/plugins/authorizeRoles');

async function productRoutes(fastify, opts) {
  // Get all products (Guest access allowed)
  fastify.get('/products', async (req, reply) => {
    const products = await getAllProducts();
    reply.status(200).send(products);
  });

  // Get product by ID (Guest access allowed)
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

  // Create a new product (Admin only)
  fastify.post('/products', {
    preHandler: [fastify.authenticate, authorizeRoles(['admin'])],
    preValidation: async (req) => {
      const { error } = productCreateSchema.validate(req.body);
      if (error) {
        throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
      }
    },
  }, async (req, reply) => {
    const product = await createProduct(req.body);
    reply.status(201).send({ success: true, product });
  });

  // Update an existing product (Admin only)
  fastify.put('/products/:id', {
    preHandler: [fastify.authenticate, authorizeRoles(['admin'])],
    preValidation: async (req) => {
      const bodyValidation = productUpdateSchema.validate({ ...req.body });
      if (bodyValidation.error) {
        throw new ValidationError('Validation failed for request body', bodyValidation.error.details.map(detail => detail.message));
      }
      const paramsValidation = productIdSchema.validate(req.params);
      if (paramsValidation.error) {
        throw new ValidationError('Validation failed for request params', paramsValidation.error.details.map(detail => detail.message));
      }
    },
  }, async (req, reply) => {
    const { id } = req.params;
    const product = await updateProduct(id, req.body);
    reply.status(200).send({ success: true, product });
  });

  // Delete a product (Admin only)
  fastify.delete('/products/:id', {
    preHandler: [fastify.authenticate, authorizeRoles(['admin'])],
    preValidation: async (req) => {
      const { error } = productIdSchema.validate(req.params);
      if (error) {
        throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
      }
    },
  }, async (req, reply) => {
    const { id } = req.params;
    await deleteProduct(id);
    reply.status(200).send({ success: true, message: `Product with ID ${id} deleted successfully` });
  });
}

module.exports = fastifyPlugin(productRoutes);