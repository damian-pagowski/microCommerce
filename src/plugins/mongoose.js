const mongoose = require('mongoose');

async function mongoosePlugin(fastify, options) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    fastify.log.info('Connected to MongoDB');
  } catch (err) {
    fastify.log.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

module.exports = mongoosePlugin;