const { processInventoryMessage, getInventoryByProductId } = require('../../../src/services/inventoryService');
const Inventory = require('../models/inventory');
const { publishMessage } = require('../../../src/queues/queueService');
const {
  InventoryNotFoundError,
  InventoryProcessingError,
  InventoryQuantityError,
} = require('../../../src/utils/errors');

jest.mock('../../../src/models/inventory');
jest.mock('../../../src/queues/queueService');

describe('Inventory Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processInventoryMessage', () => {
    it('should reserve stock successfully', async () => {
      const mockInventory = { productId: 1, quantity: 10, save: jest.fn() };
      Inventory.findOne.mockResolvedValue(mockInventory);

      const message = {
        type: 'RESERVE_STOCK',
        payload: { productId: 1, quantity: 5 },
      };

      await processInventoryMessage(message);

      expect(mockInventory.quantity).toBe(5);
      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should rollback stock successfully', async () => {
      const mockInventory = { productId: 1, quantity: 5, save: jest.fn() };
      Inventory.findOne.mockResolvedValue(mockInventory);

      const message = {
        type: 'ROLLBACK_STOCK',
        payload: { productId: 1, quantity: 5 },
      };

      await processInventoryMessage(message);

      expect(mockInventory.quantity).toBe(10);
      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should throw InventoryNotFoundError for non-existent product', async () => {
      Inventory.findOne.mockResolvedValue(null);

      const message = {
        type: 'RESERVE_STOCK',
        payload: { productId: 999, quantity: 5 },
      };

      await expect(processInventoryMessage(message)).rejects.toThrow(InventoryNotFoundError);

      expect(publishMessage).not.toHaveBeenCalled();
    });

    it('should throw InventoryQuantityError for insufficient stock', async () => {
      const mockInventory = { productId: 1, quantity: 2, save: jest.fn() };
      Inventory.findOne.mockResolvedValue(mockInventory);

      const message = {
        type: 'RESERVE_STOCK',
        payload: { productId: 1, quantity: 5, orderId: 'mockOrderId' },
      };

      await expect(processInventoryMessage(message)).rejects.toThrow(InventoryQuantityError);

      expect(publishMessage).toHaveBeenCalledWith('orders.queue', {
        type: 'ORDER_FAILED',
        payload: {
          orderId: 'mockOrderId',
          reason: 'Insufficient stock for product 1. Available: 2, Requested: 5',
        },
      });
    });

    it('should throw InventoryProcessingError for unknown message type', async () => {
      const message = {
        type: 'UNKNOWN_TYPE',
        payload: { productId: 1, quantity: 5 },
      };

      await expect(processInventoryMessage(message)).rejects.toThrow(InventoryProcessingError);

      expect(publishMessage).not.toHaveBeenCalled();
    });
  });

  describe('getInventoryByProductId', () => {
    it('should return inventory details for a valid product ID', async () => {
      const mockInventory = { productId: 1, quantity: 10 };
      Inventory.findOne.mockResolvedValue(mockInventory);

      const result = await getInventoryByProductId(1);

      expect(result).toEqual(mockInventory);
      expect(Inventory.findOne).toHaveBeenCalledWith({ productId: 1 }, { _id: 0, __v: 0 });
    });

    it('should throw InventoryNotFoundError for non-existent product', async () => {
      Inventory.findOne.mockResolvedValue(null);

      await expect(getInventoryByProductId(999)).rejects.toThrow(InventoryNotFoundError);
    });

    it('should throw InventoryProcessingError for database issues', async () => {
      Inventory.findOne.mockRejectedValue(new Error('Database error'));

      await expect(getInventoryByProductId(1)).rejects.toThrow(InventoryProcessingError);
    });
  });
});