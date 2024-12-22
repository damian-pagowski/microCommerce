const mongoose = require('mongoose');
const redisClient = require('../src/services/redisClient');
const Product = require('../src/models/product');
require('dotenv').config();

(async () => {
  // await redisClient();
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Update Redis cache
    const products = await Product.find({}, { productId: 1, price: 1, name: 1, _id: 0 });
    for (const product of products) {
      await redisClient.set(`product:${product.productId}`, JSON.stringify(product), { EX: 3600 });
    }
    console.log('Redis cache updated with product data.');

    process.exit(0);
  } catch (err) {
    console.error('Error updating Redis cache:', err);
    process.exit(1);
  }
})();