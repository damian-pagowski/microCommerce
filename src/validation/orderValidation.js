const Joi = require('joi');

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required().description('ID of the product'),
        quantity: Joi.number().integer().positive().required().description('Quantity of the product'),
      })
    )
    .min(1)
    .required()
    .description('List of items to order'),
});

const orderIdSchema = Joi.object({
  id: Joi.string()
    .length(24)
    .required()
    .description('ID of the order (24-character MongoDB ObjectId)'),
});

module.exports = { createOrderSchema, orderIdSchema };