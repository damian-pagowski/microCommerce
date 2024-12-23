const { publishMessage } = require('../queues/queueService');
const { PaymentError } = require('../utils/errors');

const processPayment = async ({ orderId, amount, currency, cardDetails }) => {

  /* TODO add check for curr and amount */
  try {
    const { name } = cardDetails;

    if (!name) {
      throw new PaymentError('Invalid card details', 'Cardholder name is missing');
    }

    if (name.toLowerCase() === 'broke user') {
      await publishMessage('payments.queue', {
        type: 'PAYMENT_FAILED',
        payload: {
          orderId,
          reason: 'Insufficient funds',
          amount,
          currency,
        },
      });

      return {
        status: 'rejected',
        reason: 'Insufficient funds',
        orderId,
      };
    }

    // Simulate successful payment
    const paymentId = `payment_${Math.random().toString(36).substring(7)}`;
    await publishMessage('payments.queue', {
      type: 'PAYMENT_SUCCESS',
      payload: { orderId, amount, currency },
    });

    return {
      status: 'success',
      paymentId,
      orderId,
    };
  } catch (error) {
    console.error('Error in processPayment:', error.message);
    throw error instanceof PaymentError ? error : new PaymentError('Payment processing failed');
  }
};

module.exports = { processPayment };