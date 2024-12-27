const fastify = require('fastify');
const orderRoutes = require('../../routes/orderRoutes');
const { createOrder, getOrderById } = require('../../services/orderService');
const { ValidationError } = require('../../shared/utils/errors');

jest.mock('../../services/orderService'); // Mock the order service

describe('Order Routes', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    app.decorate('authenticate', async (req) => {
      req.user = { username: 'damian12345678' }; // Mock user authentication
    });
    app.register(orderRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create an order with valid data', async () => {
      const mockOrder = {
        username: 'damian12345678',
        items: [
          { productId: 1, name: 'Snake 3D', quantity: 1, price: 99.99, _id: '676e876f19821413b6088ca5' },
          { productId: 3, name: 'Durian Premium Pro', quantity: 1, price: 2999.99, _id: '676e876f19821413b6088ca6' },
        ],
        totalPrice: 3099.98,
        status: 'pending',
        _id: '676e876f19821413b6088ca4',
        createdAt: '2024-12-27T10:54:39.597Z',
        updatedAt: '2024-12-27T10:54:39.597Z',
      };

      createOrder.mockResolvedValue(mockOrder);

      const response = await app.inject({
        method: 'POST',
        url: '/orders',
        payload: {
          items: [
            { productId: 1, quantity: 1 },
            { productId: 3, quantity: 1 },
          ],
        },
      });

      expect(response.statusCode).toBe(201);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.order).toEqual(mockOrder);
      expect(createOrder).toHaveBeenCalledWith('damian12345678', [
        { productId: 1, quantity: 1 },
        { productId: 3, quantity: 1 },
      ]);
    });

    it('should return 400 for invalid request payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/orders',
        payload: {
          invalidField: 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order details for a valid order ID', async () => {
      const mockOrder = {
        username: 'damian12345678',
        items: [
          { productId: 1, name: 'Snake 3D', quantity: 1, price: 99.99, _id: '676e876f19821413b6088ca5' },
          { productId: 3, name: 'Durian Premium Pro', quantity: 1, price: 2999.99, _id: '676e876f19821413b6088ca6' },
        ],
        totalPrice: 3099.98,
        status: 'pending',
        _id: '676e876f19821413b6088ca4',
        createdAt: '2024-12-27T10:54:39.597Z',
        updatedAt: '2024-12-27T10:54:39.597Z',
      };

      getOrderById.mockResolvedValue(mockOrder);

      const response = await app.inject({
        method: 'GET',
        url: '/orders/676e876f19821413b6088ca4',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.order).toEqual(mockOrder);
      expect(getOrderById).toHaveBeenCalledWith('676e876f19821413b6088ca4', 'damian12345678');
    });

    it('should return 400 for invalid order ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/orders/invalid-id',
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('message', 'Validation failed');
    });
  });
});