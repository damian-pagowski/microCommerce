require('dotenv').config();
const fastify = require('fastify')({
  logger:
    process.env.NODE_ENV === 'production'
      ? true 
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        },
});
const { setLogger } = require('./src/utils/logger');
setLogger(fastify);


const fastifyJWT = require('fastify-jwt');
const corsPlugin = require('./src/plugins/cors');
// const swaggerPlugin = require('./src/plugins/swagger');
const mongoosePlugin = require('./src/plugins/mongoose');
const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { connectQueue, consumeMessage } = require('./src/queues/queueService');
const { processInventoryMessage } = require('./src/services/inventoryService');
const { processOrderMessages, processPaymentMessages } = require('./src/services/orderService');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const PORT = process.env.PORT || 3000;
const { getLogger } = require('./src/utils/logger');
const logger = getLogger();

// Middleware: Authentication
fastify.decorate('authenticate', async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid token');
      return reply.status(401).send({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = fastify.jwt.verify(token);
    req.user = decoded;
  } catch (err) {
    logger.error('Authentication error:', err);
    reply.status(401).send({ message: 'Invalid or expired token' });
  }
});

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const response = {
    statusCode,
    message: error.message || 'An unexpected error occurred',
  };
  if (error.fields) {
    response.details = error.fields;
  }
  logger.error(error);
  reply.status(statusCode).send(response);
});

// Register Plugins
fastify.register(corsPlugin);
// fastify.register(swaggerPlugin);
fastify.register(mongoosePlugin);
fastify.register(fastifyJWT, {
  secret: JWT_SECRET,
  sign: { algorithm: 'HS256' },
});

// Register Routes
fastify.register(productRoutes);
fastify.register(inventoryRoutes);
fastify.register(userRoutes);
fastify.register(orderRoutes);
fastify.register(paymentRoutes);

// Start Server
const startServer = async () => {
  try {
    // Connect to RabbitMQ and consume messages
    await connectQueue();
    logger.info('RabbitMQ connected.');
    await consumeMessage('inventory.queue', processInventoryMessage);
    await consumeMessage('payments.queue', processPaymentMessages);
    await consumeMessage('orders.queue', processOrderMessages);
    // Start the Fastify server
    await fastify.listen({ port: PORT });
    logger.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    logger.fatal('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();