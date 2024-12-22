const Product = require('../models/product');
const redisClient = require('./redisClient');

const { NotFoundError, DatabaseError } = require('../utils/errors');

const getAllProducts = async () => {
  try {
    return await Product.find({}, { __v: 0 });
  } catch (error) {
    throw new DatabaseError('Failed to fetch products', error);
  }
};

const getProductById = async (productId) => {
  try {
    const product = await Product.findOne({ productId }, { __v: 0, _id });
    if (!product) {
      throw new NotFoundError('Product', productId);
    }
    return product;
  } catch (error) {
    throw new DatabaseError(`Failed to fetch product with ID: ${productId}`, error);
  }
};

const createProduct = async (productData) => {
  try {
    const newProduct = new Product(productData);
    return await newProduct.save();
  } catch (error) {
    throw new DatabaseError('Failed to create product', error);
  }
};

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
    return updatedProduct;
  } catch (error) {
    throw new DatabaseError(`Failed to update product with ID: ${productId}`, error);
  }
};

const deleteProduct = async (productId) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ productId });
    if (!deletedProduct) {
      throw new NotFoundError('Product', productId);
    }
    return deletedProduct;
  } catch (error) {
    throw new DatabaseError(`Failed to delete product with ID: ${productId}`, error);
  }
};

const updateProductCache = async () => {
  const products = await Product.find({}, { productId: 1, price: 1, _id: 0 });
  for (const product of products) {
    await redisClient.set(`product:${product.productId}`, JSON.stringify(product), { EX: 3600 }); // Cache expires in 1 hour
  }
  console.log('Product cache updated');
};

const getProductPriceFromCache = async (productId) => {
  const cachedProduct = await redisClient.get(`product:${productId}`);
  if (!cachedProduct) return null;
  return JSON.parse(cachedProduct).price;
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