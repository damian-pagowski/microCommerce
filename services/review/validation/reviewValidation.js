const Joi = require('joi');

const createReviewSchema = Joi.object({
    productId: Joi.number().integer().min(1).required().label('Product ID'),
    rating: Joi.number().integer().min(1).max(5).required().label('Rating'),
    comment: Joi.string().max(500).optional().label('Comment'),
});

const productIdSchema = Joi.object({
    productId: Joi.number().integer().min(1).required().label('Product ID'),
});

module.exports = {
    createReviewSchema,
    productIdSchema,
};