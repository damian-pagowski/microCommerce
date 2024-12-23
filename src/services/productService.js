const Product = require('../models/product');
const redisClient = require('./redisClient');
const { NotFoundError, DatabaseError } = require('../utils/errors');

/**
 * Fetch all products from the database
 */
const getAllProducts = async () => {
  try {
    return await Product.find({}, { __v: 0 });
  } catch (error) {
    console.error('Error fetching all products:', error.message);
    throw new DatabaseError('Failed to fetch products', error);
  }
};

/**
 * Fetch a product by its ID
 * @param {string} productId 
 */
const getProductById = async (productId) => {
  try {
    const product = await Product.findOne({ productId }, { __v: 0, _id: 0 });
    if (!product) {
      throw new NotFoundError('Product', productId);
    }
    return product;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    console.error(`Error fetching product with ID ${productId}:`, error.message);
    throw new DatabaseError(`Failed to fetch product with ID: ${productId}`, error);
  }
};

/**
 * Create a new product
 * @param {object} productData 
 */
const createProduct = async (productData) => {
  try {
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    await updateProductCache();
    return savedProduct;
  } catch (error) {
    console.error('Error creating product:', error.message);
    throw new DatabaseError('Failed to create product', error);
  }
};

/**
 * Update an existing product
 * @param {string} productId 
 * @param {object} productData 
 */
const updateProduct = async (productId, productData) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { productId },
      productData,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      throw new NotFoundError('Product', productId);
    }
    await updateProductCache();
    return updatedProduct;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    console.error(`Error updating product with ID ${productId}:`, error.message);
    throw new DatabaseError(`Failed to update product with ID: ${productId}`, error);
  }
};

/**
 * Delete a product
 * @param {string} productId 
 */
const deleteProduct = async (productId) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ productId });
    if (!deletedProduct) {
      throw new NotFoundError('Product', productId);
    }
    await updateProductCache();
    return deletedProduct;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    console.error(`Error deleting product with ID ${productId}:`, error.message);
    throw new DatabaseError(`Failed to delete product with ID: ${productId}`, error);
  }
};

/**
 * Update the Redis cache with product data
 */
const updateProductCache = async () => {
  try {
    const products = await Product.find({}, { productId: 1, price: 1, name: 1, _id: 0 });
    for (const product of products) {
      await redisClient.set(
        `product:${product.productId}`,
        JSON.stringify(product),
        { EX: 3600 } // Cache expires in 1 hour
      );
    }
    console.log('Product cache updated');
  } catch (error) {
    console.error('Error updating product cache:', error.message);
  }
};

/**
 * Get product price from Redis cache
 * @param {string} productId 
 */
const getProductPriceFromCache = async (productId) => {
  try {
    const cachedProduct = await redisClient.get(`product:${productId}`);
    return cachedProduct ? JSON.parse(cachedProduct).price : null;
  } catch (error) {
    console.error('Error fetching product price from cache:', error.message);
    return null;
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductCache,
  getProductPriceFromCache
};