const Order = require('../models/order');
const { DatabaseError, ValidationError, NotFoundError } = require('../utils/errors');
const { publishMessage } = require('../queues/queueService');
const redisClient = require('../clients/redisClient');
const { getLogger } = require('../utils/logger');
const logger = getLogger();

/**
 * Handle payment messages
 */
const processPaymentMessages = async (msg) => {
    const { type, payload } = msg;
    switch (type) {
        case 'PAYMENT_SUCCESS':
            await handlePaymentSuccess(payload);
            break;
        case 'PAYMENT_FAILED':
            await handlePaymentFailure(payload);
            break;
        default:
            console.warn(`Unhandled message type: ${type}`);
    }
};

const processOrderMessages = async (msg) => {
    const { type, payload } = msg;
    if (type === 'ORDER_FAILED') {
        const { orderId, reason } = payload;
        await handleOrderFailure(orderId, reason);
    } else {
        console.warn(`Unhandled message type: ${type}`);
    }
};

const handleOrderFailure = async (orderId, reason) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError('Order', orderId);
        }
        order.status = 'failed';
        order.failureReason = reason;
        await order.save();
        logger.info(`Order ${orderId} marked as failed. Reason: ${reason}`);
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        logger.error('Failed to mark order as failed:', error.message);
        throw new DatabaseError('Failed to update order status to failed', error);
    }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (payload) => {
    try {
        const { orderId, amount, currency } = payload;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError('Order', orderId);
        }
        // Only EUR payments               
        if (!(amount == order.totalPrice && currency == 'EUR')) {
            // Insufficient payment
            order.status = 'failed';
            order.failureReason = `Insufficient payment. Paid: ${amount} ${currency}, Expected: ${order.totalPrice} EUR`;
            await order.save();

            logger.error(
                `Payment for order ${orderId} failed. Paid: ${amount} ${currency}, Expected: ${order.totalPrice} EUR`
            );

            return { success: false, message: `Payment insufficient for order ${orderId}` };
        }

        // Full payment success
        order.status = 'paid';
        await order.save();

        logger.info(`Order ${orderId} successfully updated to 'paid' status.`);
        return { success: true, message: `Order ${orderId} marked as paid.` };
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.error(`Order not found: ${orderId}`);
            throw error;
        }
        logger.error(`Failed to update order ${orderId}:`, error);
        throw new DatabaseError(`Failed to update order ${orderId} to 'paid'`, error);
    }
};
/**
 * Handle failed payment
 */
const handlePaymentFailure = async (payload) => {
    const { orderId, reason } = payload;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError('Order', orderId);
    }
    order.status = 'failed';
    order.failureReason = reason;
    await order.save();
    logger.info(`Order ${orderId} marked as failed. Reason: ${reason}`);
};

/**
 * Reserve stock for order
 */
const reserveStock = async (items, orderId) => {
    for (const item of items) {
        await publishMessage('inventory.queue', {
            type: 'RESERVE_STOCK',
            payload: { productId: item.productId, quantity: item.quantity, orderId },
        });
    }
};

/**
 * Create a new order
 */
const createOrder = async (username, items) => {
    const productPriceMap = {};

    for (const item of items) {
        const cachedProduct = await redisClient.get(`product:${item.productId}`);
        if (!cachedProduct) {
            throw new ValidationError(`Product ${item.productId} not found in cache`);
        }
        const product = JSON.parse(cachedProduct);
        productPriceMap[item.productId] = product.price;
        item.price = product.price;
        item.name = product.name;
    }

    const totalPrice = Math.round(
        items.reduce(
            (sum, item) => sum + item.quantity * productPriceMap[item.productId],
            0
        ) * 100
    ) / 100;

    const order = new Order({ username, items, totalPrice, status: 'pending' });
    const orderId =  order._id.toString();
    await reserveStock(items, orderId); // Throws error if stock reservation fails
    await order.save();

    logger.info('Order created:', order);
    return order;
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId, username) => {
    const order = await Order.findOne({ _id: orderId, username });
    if (!order) {
        throw new NotFoundError('Order', orderId);
    }
    return order;
};

module.exports = {
    createOrder,
    getOrderById,
    processPaymentMessages,
    processOrderMessages
};