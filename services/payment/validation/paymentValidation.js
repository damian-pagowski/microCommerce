const Joi = require('joi');

const cardDetailsSchema = Joi.object({
  name: Joi.string().required().description('Name on the card'),
  cardNumber: Joi.string()
    .creditCard()
    .required()
    .description('Credit card number'),
  expiryDate: Joi.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .required()
    .description('Card expiry date in MM/YY format'),
  cvv: Joi.string()
    .regex(/^\d{3}$/)
    .required()
    .description('Card CVV code (3 digits)'),
});

const paymentSchema = Joi.object({
  orderId: Joi.string().required().description('ID of the order'),
  amount: Joi.number().positive().required().description('Amount to be paid'),
  currency: Joi.string().required().description('Currency of the payment (e.g., EUR, USD)'),
  cardDetails: cardDetailsSchema.required(),
});

module.exports = { paymentSchema };