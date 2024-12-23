const Joi = require('joi');

const productIdSchema = Joi.object({
  productId: Joi.number().integer().positive().required().description('The ID of the product'),
});

module.exports = { productIdSchema };