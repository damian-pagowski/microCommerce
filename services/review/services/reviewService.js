const Review = require('../models/review');
const { ValidationError, NotFoundError } = require('../shared/utils/errors');
const redisClient = require('../shared/clients/redisClient');

// Get review statistics
const getReviewStatsByProductId = async (productId) => {
    const cacheKey = `reviewStats:${productId}`;
    const cachedStats = await redisClient.get(cacheKey);
    const productIdInt = parseInt(productId, 10);

    if (cachedStats) {
        return JSON.parse(cachedStats);
    }

    const stats = await Review.aggregate([
        { $match: { productId: productIdInt, status: 'active' } },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: { $multiply: ['$_id', '$count'] } },
                totalReviews: { $sum: '$count' },
                distribution: {
                    $push: {
                        rating: '$_id',
                        count: '$count',
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                averageRating: { $round: ['$averageRating', 1] },
                totalReviews: 1,
                distribution: {
                    $arrayToObject: {
                        $map: {
                            input: '$distribution',
                            as: 'dist',
                            in: { k: { $toString: '$$dist.rating' }, v: '$$dist.count' },
                        },
                    },
                },
            },
        },
    ]);

    const result = stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        distribution: {},
    };

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return result;
};

// Create a review
const createReview = async ({ productId, username, rating, comment }) => {
    if (!productId || !username || !rating) {
        throw new ValidationError('Missing required fields: productId, username, or rating');
    }

    const review = new Review({
        productId,
        username,
        rating,
        comment,
    });

    return await review.save();
};

// Get reviews for a product, excluding hidden reviews
const getReviewsByProductId = async (productId) => {
    return await Review.find({ productId, status: 'active' }).sort({ createdAt: -1 });
};

// Update review status (soft delete)
const updateReviewStatus = async (reviewId, status) => {
    const allowedStatuses = ['active', 'hidden'];
    if (!allowedStatuses.includes(status)) {
        throw new ValidationError('Invalid status value');
    }

    const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { status },
        { new: true, runValidators: true }
    );

    if (!updatedReview) {
        throw new NotFoundError('Review', reviewId);
    }

    return updatedReview;
};

module.exports = {
    createReview,
    getReviewsByProductId,
    getReviewStatsByProductId,
    updateReviewStatus,
};