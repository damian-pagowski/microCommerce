const { publishMessage } = require('../queues/queueService');

const processPayment = async ({ orderId, amount, currency, cardDetails }) => {
  // Simulate payment processing logic
  const { name } = cardDetails;

  // if (name.toLowerCase() === 'broke user') {
  //   return {
  //     status: 'rejected',
  //     reason: 'insufficient funds',
  //     orderId,
  //   };
  // }

  if (name.toLowerCase() === 'broke user') {
    await publishMessage('payments.queue', {
      type: 'PAYMENT_FAILED',
      payload: {
        orderId,
        reason: 'insufficient funds',
      },
    });
  
    return {
      status: 'rejected',
      reason: 'insufficient funds',
      orderId,
    };
  }


  // Simulate successful payment
  const paymentId = `payment_${Math.random().toString(36).substring(7)}`;
  await publishMessage('payments.queue', {
    type: 'PAYMENT_SUCCESS',
    payload: { orderId },
  });

  return {
    status: 'success',
    paymentId,
    orderId,
  };
};

module.exports = { processPayment };