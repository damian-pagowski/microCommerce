const fastify = require('fastify');
const orderRoutes = require('../../routes/orderRoutes');
const { createOrder, getOrderById, getOrderHistoryByUsername } = require('../../services/orderService');

jest.mock('../../services/orderService', () => ({
  createOrder: jest.fn(),
  getOrderById: jest.fn(),
  getOrderHistoryByUsername: jest.fn(),
}));

describe('Order Routes', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    app.decorate('authenticate', async (req) => {
      req.user = { username: 'damian12345678' };
    });
    app.register(orderRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    jest.clearAllMocks();
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

  describe('GET /orders', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return a list of orders for a valid username', async () => {
      const mockOrders = [
        {
          _id: '123',
          username: 'damian12345678',
          items: [
            { productId: 1, name: 'Snake 3D', quantity: 1, price: 99.99 },
            { productId: 3, name: 'Durian Premium Pro', quantity: 1, price: 2999.99 },
          ],
          totalPrice: 3099.98,
          status: 'pending',
          createdAt: '2024-12-27T10:54:39.597Z',
          updatedAt: '2024-12-27T10:54:39.597Z',
        },
        {
          _id: '456',
          username: 'damian12345678',
          items: [
            { productId: 5, name: 'Divide and Conquer', quantity: 2, price: 19.99 },
          ],
          totalPrice: 39.98,
          status: 'shipped',
          createdAt: '2024-12-26T12:12:12.597Z',
          updatedAt: '2024-12-26T12:12:12.597Z',
        },
      ];

      getOrderHistoryByUsername.mockResolvedValue(mockOrders);

      const response = await app.inject({
        method: 'GET',
        url: '/orders',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.orders).toEqual(mockOrders);
      expect(getOrderHistoryByUsername).toHaveBeenCalledWith('damian12345678');
    });

    it('should return an empty array if the user has no orders', async () => {
      getOrderHistoryByUsername.mockResolvedValue([]);

      const response = await app.inject({
        method: 'GET',
        url: '/orders',
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.orders).toEqual([]);
      expect(getOrderHistoryByUsername).toHaveBeenCalledWith('damian12345678');
    });
  });
});