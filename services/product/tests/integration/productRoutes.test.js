const fastify = require('fastify');
const productRoutes = require('../../routes/productRoutes');
const { getAllProducts, getProductById } = require('../../services/productService');

jest.mock('../../services/productService');

describe('Product Routes', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    app.register(productRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          _id: '67629778943ffd5adff21e6e',
          name: 'Mockia',
          image: '/images/products/phone.webp',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
          rating: 5,
          price: 19.99,
          productId: 6,
          category: 'phones',
          subcategory: 'smartphones',
          badges: [],
        },
        {
          _id: '67629778943ffd5adff21e6f',
          name: 'Age Of Colonies',
          image: '/images/products/strategy2.jpeg',
          description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit.',
          rating: 5,
          price: 5.99,
          productId: 7,
          category: 'games',
          subcategory: 'ps4',
          badges: ['Best Seller'],
        },
      ];

      getAllProducts.mockResolvedValue(mockProducts);

      const response = await app.inject({
        method: 'GET',
        url: '/products',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual(mockProducts);
      expect(getAllProducts).toHaveBeenCalled();
    });
  });

  describe('GET /products/:id', () => {
    it('should return product details for a valid ID', async () => {
      const mockProduct = {
        name: 'Durian Deluxe',
        image: '/images/products/phone.webp',
        description: 'Cras purus odio, vestibulum in vulputate at, tempus viverra turpis.',
        rating: 3,
        price: 999.99,
        productId: 2,
        category: 'phones',
        subcategory: 'smartphones',
        badges: ['Our Choice'],
      };

      getProductById.mockResolvedValue(mockProduct);

      const response = await app.inject({
        method: 'GET',
        url: '/products/2',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual(mockProduct);
      expect(getProductById).toHaveBeenCalledWith('2');
    });
  });
});