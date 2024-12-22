require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const fastifyJWT = require('fastify-jwt');

const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const { connectQueue } = require('./src/queues/queueService');
const { processInventoryMessage } = require('./src/services/inventoryService');
const { consumeMessage } = require('./src/queues/queueService');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { handlePayment } = require('./src/services/orderService'); 


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register JWT Plugin
fastify.register(fastifyJWT, {
  secret: JWT_SECRET,
  sign: { algorithm: 'HS256' }, // Explicitly match algorithm
});



// Decorate Fastify Instance with Authentication Middleware
fastify.decorate('authenticate', async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = fastify.jwt.verify(token);
    req.user = decoded;
  } catch (err) {
    reply.status(401).send({ message: 'Invalid or expired token' });
  }
});

// Register plugins
 fastify.register(require('./src/plugins/cors'));
 fastify.register(require('./src/plugins/swagger'));
 fastify.register(require('./src/plugins/mongoose'));
//  fastify.register(require('./src/queues/rabbitmq'));

// Register routes
 fastify.register(productRoutes);
 fastify.register(inventoryRoutes);
 fastify.register(userRoutes);
 fastify.register(orderRoutes);
 fastify.register(paymentRoutes);


// Start Server
const start = async () => {
  try {
    await connectQueue();
    console.log('RabbitMQ connected.');
    await consumeMessage('inventory.queue', processInventoryMessage);
    await consumeMessage('payments.queue', handlePayment);
 
    const PORT = process.env.PORT || 3000;
    await fastify.listen({ port: PORT });
    console.log(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();