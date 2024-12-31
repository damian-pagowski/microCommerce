const Review = require('../models/review');
const { ValidationError } = require('../shared/utils/errors');
const redisClient = require('../shared/clients/redisClient'); 

const getReviewStatsByProductId = async (productId) => {

    const cacheKey = `reviewStats:${productId}`;
    const cachedStats = await redisClient.get(cacheKey);
    const productIdInt = parseInt(productId, 10); 

    if (cachedStats) {
        return JSON.parse(cachedStats); 
    }

    // Perform MongoDB aggregation
    const stats = await Review.aggregate([
        { $match: { productId: productIdInt } }, 
        {
            $group: {
                _id: '$rating', // Group by rating
                count: { $sum: 1 }, // Count reviews per rating
            },
        },
        {
            $group: {
                _id: null, // Combine all ratings
                averageRating: { $avg: { $multiply: ['$_id', '$count'] } }, // Weighted average calculation
                totalReviews: { $sum: '$count' }, // Calculate total reviews
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
                averageRating: { $round: ['$averageRating', 1] }, // Round average to 1 decimal place
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

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300); // Cache for 5 minutes

    return result;
};

const createReview = async ({ productId, username, rating, comment }) => {
    if (!productId || !username || !rating) {
        throw new ValidationError('Missing required fields: productId, userId, or rating');
    }

    const review = new Review({
        productId,
        username,
        rating,
        comment,
    });

    return await review.save();
};

const getReviewsByProductId = async (productId) => {
    return await Review.find({ productId }).sort({ createdAt: -1 });
};

module.exports = {
    createReview,
    getReviewsByProductId,
    getReviewStatsByProductId
};