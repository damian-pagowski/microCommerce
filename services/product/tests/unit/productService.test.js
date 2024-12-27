const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductPriceFromCache } = require('../../services/productService');

const Product = require('../../models/product');
const redisClient = require('../../shared/clients/redisClient');
const { NotFoundError, DatabaseError } = require('../../shared/utils/errors');

jest.mock('../../models/product');
jest.mock('../../shared/clients/redisClient', () => {

    return {
        connect: jest.fn(() => Promise.resolve()),
        quit: jest.fn(() => Promise.resolve()),
        get: jest.fn(),
        set: jest.fn(),
      };
  });


describe('Product Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should fetch all products successfully', async () => {
      Product.find.mockResolvedValue([{ name: 'Test Product', productId: 1 }]);

      const result = await getAllProducts();
      expect(result).toEqual([{ name: 'Test Product', productId: 1 }]);
      expect(Product.find).toHaveBeenCalledWith({}, { __v: 0 });
    });

    it('should throw DatabaseError on failure', async () => {
      Product.find.mockRejectedValue(new Error('Database failure'));

      await expect(getAllProducts()).rejects.toThrow(DatabaseError);
    });
  });

  describe('getProductById', () => {
    it('should return the product if it exists', async () => {
      Product.findOne.mockResolvedValue({ name: 'Test Product', productId: 1 });

      const result = await getProductById(1);
      expect(result).toEqual({ name: 'Test Product', productId: 1 });
      expect(Product.findOne).toHaveBeenCalledWith({ productId: 1 }, { __v: 0, _id: 0 });
    });

    it('should throw NotFoundError if product does not exist', async () => {
      Product.findOne.mockResolvedValue(null);

      await expect(getProductById(1)).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError on failure', async () => {
      Product.findOne.mockRejectedValue(new Error('Database failure'));

      await expect(getProductById(1)).rejects.toThrow(DatabaseError);
    });
  });

  describe('createProduct', () => {
    it('should create and return a new product', async () => {
      const mockProduct = { name: 'New Product', productId: 2 };
      Product.prototype.save = jest.fn().mockResolvedValue(mockProduct);

      const result = await createProduct(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw DatabaseError on failure', async () => {
      Product.prototype.save = jest.fn().mockRejectedValue(new Error('Database failure'));

      await expect(createProduct({ name: 'New Product' })).rejects.toThrow(DatabaseError);
    });
  });

  describe('updateProduct', () => {
    it('should update and return the product', async () => {
      const updatedProduct = { name: 'Updated Product', productId: 2 };
      Product.findOneAndUpdate.mockResolvedValue(updatedProduct);

      const result = await updateProduct(2, { name: 'Updated Product' });
      expect(result).toEqual(updatedProduct);
      expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
        { productId: 2 },
        { name: 'Updated Product' },
        { new: true, runValidators: true }
      );
    });

    it('should throw NotFoundError if product does not exist', async () => {
      Product.findOneAndUpdate.mockResolvedValue(null);

      await expect(updateProduct(2, { name: 'Updated Product' })).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError on failure', async () => {
      Product.findOneAndUpdate.mockRejectedValue(new Error('Database failure'));

      await expect(updateProduct(2, { name: 'Updated Product' })).rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteProduct', () => {
    it('should delete and return the product', async () => {
      const deletedProduct = { name: 'Deleted Product', productId: 3 };
      Product.findOneAndDelete.mockResolvedValue(deletedProduct);

      const result = await deleteProduct(3);
      expect(result).toEqual(deletedProduct);
      expect(Product.findOneAndDelete).toHaveBeenCalledWith({ productId: 3 });
    });

    it('should throw NotFoundError if product does not exist', async () => {
      Product.findOneAndDelete.mockResolvedValue(null);

      await expect(deleteProduct(3)).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError on failure', async () => {
      Product.findOneAndDelete.mockRejectedValue(new Error('Database failure'));

      await expect(deleteProduct(3)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getProductPriceFromCache', () => {
    it('should return price from cache if available', async () => {
      const cachedProduct = JSON.stringify({ price: 100 });
      redisClient.get.mockResolvedValue(cachedProduct);

      const price = await getProductPriceFromCache(1);
      expect(price).toEqual(100);
      expect(redisClient.get).toHaveBeenCalledWith('product:1');
    });

    it('should return null if cache is empty', async () => {
      redisClient.get.mockResolvedValue(null);

      const price = await getProductPriceFromCache(1);
      expect(price).toBeNull();
    });
  });
});