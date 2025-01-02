const Joi = require('joi');

const productIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().description('ID of the product as a positive integer'),
});

const productCreateSchema = Joi.object({
  name: Joi.string().required().description('Name of the product'),
  description: Joi.string().required().description('Description of the product'),
  price: Joi.number().positive().required().description('Price of the product'),
  category: Joi.string().required().description('Category of the product'),
  subcategory: Joi.string().required().description('Subcategory of the product'),
  image: Joi.string().uri().required().description('URL of the product image'),
  badges: Joi.array().items(Joi.string()).optional().description('Optional badges for the product'),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().optional().description('Name of the product'),
  description: Joi.string().optional().description('Description of the product'),
  price: Joi.number().positive().optional().description('Price of the product'),
  category: Joi.string().optional().description('Category of the product'),
  subcategory: Joi.string().optional().description('Subcategory of the product'),
  image: Joi.string().uri().optional().description('URL of the product image'),
  badges: Joi.array().items(Joi.string()).optional().description('Optional badges for the product'),
});

module.exports = { productIdSchema, productCreateSchema, productUpdateSchema };
