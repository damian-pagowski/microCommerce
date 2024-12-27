const fastify = require('fastify');
const paymentRoutes = require('../../routes/paymentRoutes');
const { processPayment } = require('../../services/paymentService');
const { ValidationError } = require('../../shared/utils/errors');

jest.mock('../../services/paymentService');

describe('Payment Routes', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    app.register(paymentRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /payments', () => {
    it('should process payment with valid data', async () => {
      const mockResponse = {
        status: 'success',
        paymentId: 'payment_0ip7i',
        orderId: '676e876f19821413b6088ca4',
      };

      processPayment.mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'POST',
        url: '/payments',
        payload: {
          orderId: '676e876f19821413b6088ca4',
          amount: 3099.98,
          currency: 'EUR',
          cardDetails: {
            name: 'John Doe',
            cardNumber: '4111111111111111',
            expiryDate: '12/26',
            cvv: '123',
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual(mockResponse);
      expect(processPayment).toHaveBeenCalledWith({
        orderId: '676e876f19821413b6088ca4',
        amount: 3099.98,
        currency: 'EUR',
        cardDetails: {
          name: 'John Doe',
          cardNumber: '4111111111111111',
          expiryDate: '12/26',
          cvv: '123',
        },
      });
    });

    it('should return 400 for invalid request payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/payments',
        payload: {
          invalidField: 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('message', 'Validation failed');
    });
  });
});