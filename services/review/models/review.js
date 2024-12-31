const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: Number, required: true, ref: 'Product' },
    username: { type: String, required: true, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema);