const {
    createOrder,
    getOrderById,
    processPaymentMessages,
    processOrderMessages,
} = require('../../../src/services/orderService');

const { publishMessage } = require('../../../src/queues/queueService');
const Order = require('../../../src/models/order');
const redisClient = require('../../../src/services/redisClient');
const { NotFoundError, ValidationError } = require('../../../src/utils/errors');

jest.mock('../../../src/queues/queueService', () => ({
    publishMessage: jest.fn(),
}));

jest.mock('../../../src/models/order');
jest.mock('../../../src/services/redisClient', () => {

    return {
        connect: jest.fn(() => Promise.resolve()),
        quit: jest.fn(() => Promise.resolve()),
        get: jest.fn(),
        set: jest.fn(),
    };
});
describe('Order Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {

        it('should create an order successfully', async () => {
            const username = 'testUser';
            const items = [{ productId: 1, quantity: 2 }];
            const cachedProduct = JSON.stringify({ price: 50, name: 'Test Product' });

            // Mock Redis client
            redisClient.get.mockResolvedValue(cachedProduct);

            // Mock the Order constructor and instance
            const mockOrderId = 'mockedOrderId';
            const mockOrder = {
                _id: mockOrderId,
                save: jest.fn().mockResolvedValue(),
                username,
                items,
                totalPrice: 100,
                status: 'pending',
            };
            jest.mocked(Order).mockImplementation(() => mockOrder);

            // Call the function under test
            const order = await createOrder(username, items);

            // Assertions
            expect(redisClient.get).toHaveBeenCalledWith('product:1');
            expect(publishMessage).toHaveBeenCalledWith('inventory.queue', {
                type: 'RESERVE_STOCK',
                payload: { productId: 1, quantity: 2, orderId: mockOrderId },
            });
            expect(order.totalPrice).toBe(100);
            expect(order.status).toBe('pending');
            expect(order._id).toBe(mockOrderId);
        });

        it('should throw ValidationError if product not found in cache', async () => {
            redisClient.get.mockResolvedValue(null);

            await expect(
                createOrder('testUser', [{ productId: 1, quantity: 2 }])
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('getOrderById', () => {
        it('should fetch an order by ID', async () => {
            const mockOrder = { _id: '123', username: 'testUser', items: [], totalPrice: 100 };
            Order.findOne.mockResolvedValue(mockOrder);

            const order = await getOrderById('123', 'testUser');

            expect(Order.findOne).toHaveBeenCalledWith({ _id: '123', username: 'testUser' });
            expect(order).toEqual(mockOrder);
        });

        it('should throw NotFoundError if order not found', async () => {
            Order.findOne.mockResolvedValue(null);

            await expect(getOrderById('123', 'testUser')).rejects.toThrow(NotFoundError);
        });
    });

    describe('processPaymentMessages', () => {
        it('should handle PAYMENT_SUCCESS message', async () => {
            const mockOrder = { _id: '123', totalPrice: 100, status: 'pending', save: jest.fn() };
            Order.findById.mockResolvedValue(mockOrder);

            const payload = { orderId: '123', amount: 100, currency: 'EUR' };
            await processPaymentMessages({ type: 'PAYMENT_SUCCESS', payload });

            expect(mockOrder.status).toBe('paid');
            expect(mockOrder.save).toHaveBeenCalled();
        });

        it('should handle PAYMENT_FAILED message', async () => {
            const mockOrder = { _id: '123', status: 'pending', save: jest.fn() };
            Order.findById.mockResolvedValue(mockOrder);

            const payload = { orderId: '123', reason: 'Insufficient funds' };
            await processPaymentMessages({ type: 'PAYMENT_FAILED', payload });

            expect(mockOrder.status).toBe('failed');
            expect(mockOrder.failureReason).toBe('Insufficient funds');
            expect(mockOrder.save).toHaveBeenCalled();
        });
    });

    describe('processOrderMessages', () => {
        it('should handle ORDER_FAILED message', async () => {
            const mockOrder = { _id: '123', status: 'pending', save: jest.fn() };
            Order.findById.mockResolvedValue(mockOrder);

            const payload = { orderId: '123', reason: 'Stock unavailable' };
            await processOrderMessages({ type: 'ORDER_FAILED', payload });

            expect(mockOrder.status).toBe('failed');
            expect(mockOrder.failureReason).toBe('Stock unavailable');
            expect(mockOrder.save).toHaveBeenCalled();
        });
    });
});