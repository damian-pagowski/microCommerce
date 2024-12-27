const { processPayment } = require('../../services/paymentService');
const { publishMessage } = require('../../shared/queues/queueService');
const { PaymentError } = require('../../shared/utils/errors');

jest.mock('../../shared/queues/queueService', () => ({
  publishMessage: jest.fn(),
}));

describe('processPayment', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject payment when cardholder name is "Broke User"', async () => {
    const paymentData = {
      orderId: '123',
      amount: 100,
      currency: 'USD',
      cardDetails: { name: 'Broke User' },
    };

    const result = await processPayment(paymentData);

    expect(publishMessage).toHaveBeenCalledWith('payments.queue', {
      type: 'PAYMENT_FAILED',
      payload: {
        orderId: '123',
        reason: 'Insufficient funds',
        amount: 100,
        currency: 'USD',
      },
    });
    expect(result).toEqual({
      status: 'rejected',
      reason: 'Insufficient funds',
      orderId: '123',
    });
  });

  it('should reject payment if cardholder name is missing', async () => {
    const paymentData = {
      orderId: '123',
      amount: 100,
      currency: 'USD',
      cardDetails: { name: '' },
    };

    await expect(processPayment(paymentData)).rejects.toThrow(PaymentError);
    expect(publishMessage).not.toHaveBeenCalled();
  });

  it('should process payment successfully for valid input', async () => {
    const paymentData = {
      orderId: '123',
      amount: 100,
      currency: 'USD',
      cardDetails: { name: 'Valid User' },
    };

    const result = await processPayment(paymentData);

    expect(publishMessage).toHaveBeenCalledWith('payments.queue', {
      type: 'PAYMENT_SUCCESS',
      payload: {
        orderId: '123',
        amount: 100,
        currency: 'USD',
      },
    });
    expect(result).toHaveProperty('status', 'success');
    expect(result).toHaveProperty('paymentId');
    expect(result).toHaveProperty('orderId', '123');
  });

  it('should throw a PaymentError for unexpected errors', async () => {
    publishMessage.mockRejectedValueOnce(new Error('Queue service unavailable'));

    const paymentData = {
      orderId: '123',
      amount: 100,
      currency: 'USD',
      cardDetails: { name: 'Valid User' },
    };

    await expect(processPayment(paymentData)).rejects.toThrow(PaymentError);
    expect(publishMessage).toHaveBeenCalledTimes(1);
  });
});