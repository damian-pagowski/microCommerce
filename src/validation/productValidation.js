const Joi = require('joi');

const productIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .description('ID of the product as a positive integer'),
});

module.exports = { productIdSchema };