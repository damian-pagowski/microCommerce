const reviewController = require('../services/reviewService');
const { createReviewSchema, productIdSchema } = require('../validation/reviewValidation');
const { ValidationError } = require('../shared/utils/errors');

module.exports = async function (fastify, opts) {
    fastify.get('/reviews/stats/:productId', {
        preHandler: async (request) => {
            const { error } = productIdSchema.validate(request.params);
            if (error) {
                throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
            }
        },
    }, async (request, reply) => {
        const { productId } = request.params;
        const stats = await reviewController.getReviewStatsByProductId(productId);
        reply.status(200).send({ success: true, stats });
    });

    fastify.post('/reviews', {
        preHandler: [fastify.authenticate, async (request) => {
            const { error } = createReviewSchema.validate(request.body);
            if (error) {
                throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
            }
        }],
    }, async (request, reply) => {
        const { productId, rating, comment } = request.body;
        const username = request.user.username;

        const review = await reviewController.createReview({ productId, username, rating, comment });
        reply.status(201).send({ success: true, review });
    });

    fastify.get('/reviews/:productId', {
        preHandler: async (request) => {
            const { error } = productIdSchema.validate(request.params);
            if (error) {
                throw new ValidationError('Validation failed', error.details.map(detail => detail.message));
            }
        },
    }, async (request, reply) => {
        const { productId } = request.params;
        const reviews = await reviewController.getReviewsByProductId(productId);

        reply.status(200).send({ success: true, reviews });
    });

    // Update review status (admin only)
    fastify.patch('/reviews/:id/status', {
        preHandler: [fastify.authenticate, async (request) => {
            if (request.user.role !== 'admin') {
                throw new ValidationError('Unauthorized: Only admins can update review status');
            }
        }],
    }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;

        const updatedReview = await reviewController.updateReviewStatus(id, status);

        reply.status(200).send({ success: true, review: updatedReview });
    });
};