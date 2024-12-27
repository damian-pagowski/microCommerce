const fastify = require('fastify');
const inventoryRoutes = require('../../routes/inventoryRoutes');
const { getInventoryByProductId } = require('../../services/inventoryService');
const { ValidationError } = require('../../shared/utils/errors');

jest.mock('../../services/inventoryService');

describe('Inventory Routes', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    app.register(inventoryRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /inventory/:productId', () => {
    it('should return inventory for a valid product ID', async () => {
      const mockInventory = { productId: 2, quantity: 99999 };
      getInventoryByProductId.mockResolvedValue(mockInventory);

      const response = await app.inject({
        method: 'GET',
        url: '/inventory/2',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(mockInventory);
      expect(getInventoryByProductId).toHaveBeenCalledWith('2');
    });

    it('should return 400 for an invalid product ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/inventory/invalid-id',
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('message', 'Validation failed');
    
    });
  });
});