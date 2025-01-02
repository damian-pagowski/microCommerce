const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: Number, required: true, ref: 'Product' },
    username: { type: String, required: true, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema);