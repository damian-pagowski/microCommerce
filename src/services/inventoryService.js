const Inventory = require('../models/inventory');
const { NotFoundError, InventoryError, DatabaseError } = require('../utils/errors');


/**
 * Process inventory-related messages
 * @param {object} message - The message object from RabbitMQ
 */
const processInventoryMessage = async (message) => {
  const { type, payload } = message;
  const { productId, quantity } = payload;

  try {
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      throw new InventoryError(productId, 'Product not found in inventory');
    }

    if (type === 'RESERVE_STOCK') {
      if (inventory.quantity < quantity) {
        throw new InventoryError(
          productId,
          `Insufficient stock. Available: ${inventory.quantity}, Requested: ${quantity}`
        );
      }
      inventory.quantity -= quantity;
      console.log(`Reserved ${quantity} units of product ${productId}`);
    } else if (type === 'ROLLBACK_STOCK') {
      inventory.quantity += quantity;
      console.log(`Rolled back ${quantity} units of product ${productId}`);
    } else {
      console.warn('Unknown message type:', type);
      return;
    }

    await inventory.save();
    console.log(`Inventory updated for product ${productId}`);
  } catch (error) {
    console.error('Error processing inventory message:', error.message);
    throw error;
  }
};


const getInventoryByProductId = async (productId) => {
  try {
    const inventory = await Inventory.findOne({ productId }, { _id: 0, __v: 0 });
    if (!inventory) {
      throw new NotFoundError('Inventory', productId);
    }
    return inventory;
  } catch (error) {
    throw new DatabaseError('Failed to fetch inventory', 'getInventoryByProductId', { productId, originalError: error });
  }
};

module.exports = { processInventoryMessage, getInventoryByProductId };

