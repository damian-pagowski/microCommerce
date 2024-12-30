const mongoose = require('mongoose');
const redisClient = require('../shared/clients/redisClient');
const Product = require('./models/product');
require('dotenv').config();
const { getLogger } = require('../shared/utils/logger');
const logger = getLogger();

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Update Redis cache
    const products = await Product.find({}, { productId: 1, price: 1, name: 1, _id: 0 });
    for (const product of products) {
      await redisClient.set(`product:${product.productId}`, JSON.stringify(product), { EX: 360000 });
    }
    logger.info('Redis cache updated with product data.');
    process.exit(0);
  } catch (err) {
    logger.console.error('Error updating Redis cache:', err);
    process.exit(1);
  }
})();