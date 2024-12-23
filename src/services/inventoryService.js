const Inventory = require('../models/inventory');
const {
  InventoryNotFoundError,
  InventoryProcessingError,
  InventoryQuantityError
} = require('../utils/errors');
const { publishMessage } = require('../queues/queueService');

const processInventoryMessage = async (message) => {
  const { type, payload } = message;
  const { productId, quantity } = payload;

  try {
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      throw new InventoryNotFoundError(productId);
    }

    if (type === 'RESERVE_STOCK') {
      if (inventory.quantity < quantity) {
        throw new InventoryQuantityError(productId, inventory.quantity, quantity);
      }
      inventory.quantity -= quantity;
      console.log(`Reserved ${quantity} units of product ${productId}`);
    } else if (type === 'ROLLBACK_STOCK') {
      inventory.quantity += quantity;
      console.log(`Rolled back ${quantity} units of product ${productId}`);
    } else {
      console.warn('Unknown message type:', type);
      throw new InventoryProcessingError('Unknown message type:', type);
    }

    await inventory.save();
    console.log(`Inventory updated for product ${productId}`);
  } catch (error) {
    console.error('Error processing inventory message:', error.message);
    if (type === 'RESERVE_STOCK' && payload.orderId) {
      const newPayload = {
        orderId: payload.orderId,
        reason: error.message,
      };
      await publishMessage('orders.queue', {
        type: 'ORDER_FAILED',
        payload: newPayload,
      });
    }
    if (error instanceof InventoryNotFoundError || error instanceof InventoryQuantityError){
      throw error;
    } 
    throw new InventoryProcessingError(error.message);
  }
};

const getInventoryByProductId = async (productId) => {
  try {
    const inventory = await Inventory.findOne({ productId }, { _id: 0, __v: 0 });
    if (!inventory) {
      throw new InventoryNotFoundError(productId);
    }
    return inventory;
  } catch (error) {
    if (error instanceof InventoryNotFoundError || error instanceof InventoryQuantityError) {
      throw error;
    }
    throw new InventoryProcessingError(`Failed to fetch inventory for product ${productId}: ${error.message}`);
  }
};

module.exports = { processInventoryMessage, getInventoryByProductId };