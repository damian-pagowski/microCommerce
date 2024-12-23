const mongoose = require('mongoose');
const { getLogger } = require('../utils/logger');
const logger = getLogger();

async function mongoosePlugin(fastify, options) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

module.exports = mongoosePlugin;