const Order = require('../models/order');
const { DatabaseError, ValidationError } = require('../utils/errors');
const { publishMessage } = require('../queues/queueService');
const redisClient = require('./redisClient');


const handlePayment = async (msg) => {
    const { type, payload } = msg; 
    switch (type) {
      case 'PAYMENT_SUCCESS':
        await handlePaymentSuccess(payload.orderId);
        console.log(`Order ${payload.orderId} marked as paid.`);
        break;
      case 'PAYMENT_FAILED':
        await handlePaymentFailure(payload.orderId, payload.reason);
        console.log(`Payment failed for order ${payload.orderId}: ${payload.reason}`);
        break;
      default:
        console.warn(`Unhandled message type: ${type}`);
    }
  };

  const handlePaymentSuccess = async (orderId) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Order', orderId);
      }
        order.status = 'paid';
      await order.save();
  
      console.log(`Order ${orderId} successfully updated to 'paid' status.`);
      return { success: true, message: `Order ${orderId} marked as paid.` };
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.error(`Order not found: ${orderId}`);
        throw error;
      }
      console.error(`Failed to update order ${orderId}:`, error);
      throw new DatabaseError(`Failed to update order ${orderId} to 'paid'`, error);
    }
  };

  const handlePaymentFailure = async (orderId, reason) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Order', orderId);
      }  
      order.status = 'failed';
      order.failureReason = reason;
      await order.save();
  
      console.log(`Order ${orderId} marked as failed. Reason: ${reason}`);
      return { success: true, message: `Order ${orderId} marked as failed.` };
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.error(`Order not found: ${orderId}`);
        throw error;
      }
      console.error(`Failed to update order ${orderId} to 'failed':`, error);
      throw new DatabaseError(`Failed to update order ${orderId} to 'failed'`, error);
    }
  };

async function reserveStock(items) {
    for (const item of items) {
        await publishMessage('inventory.queue', {
            type: 'RESERVE_STOCK',
            payload: { productId: item.productId, quantity: item.quantity },
        });
    }
}
/**
 * Create a new order
 * @param {string} username - The username of the customer
 * @param {array} items - The list of items to order
 */
const createOrder = async (username, items) => {
    const productPriceMap = {};

    for (const item of items) {
        const cachedProduct = await redisClient.get(`product:${item.productId}`);
        if (!cachedProduct) throw new Error(`Product ${item.productId} not found in cache`);

        const product = JSON.parse(cachedProduct);
        productPriceMap[item.productId] = product.price;
        item.price = product.price;
        item.name = product.name
    }

    const totalPrice = items.reduce((sum, item) => sum + item.quantity * productPriceMap[item.productId], 0);
    const order = new Order({ username, items, totalPrice, status: 'pending' });

    try {
        // Publish stock reservation requests
        await reserveStock(items);
        await order.save();
        console.log('Order created:', order);
        return order;
    } catch (error) {
        console.error('Error creating order:', error.message);
        throw new DatabaseError('Failed to create order', error);
    }
};

const getOrderById = async (orderId, username) => {
    try {
        const order = await Order.findOne({ _id: orderId, username });
        if (!order) {
            throw new NotFoundError('Order', orderId);
        }
        return order;
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new DatabaseError('Failed to fetch order by ID', 'getOrderById', {
            orderId,
            username,
            originalError: error,
        });
    }
};

module.exports = {
    createOrder,
    getOrderById,
    handlePayment
};


