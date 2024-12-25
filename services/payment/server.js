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
const { setLogger, getLogger } = require('./shared/utils/logger');
setLogger(fastify);
const logger = getLogger();
const fastifyJWT = require('fastify-jwt');
const corsPlugin = require('./shared/plugins/cors');
const mongoosePlugin = require('./shared/plugins/mongoose');
const paymentRoutes = require('./routes/paymentRoutes');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const PORT = process.env.PORT || 3033;
const { connectQueue, consumeMessage } = require('./shared/queues/queueService');
// prometheus client
const client = require('prom-client');

// Create a Registry to register metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Example: Custom histogram for HTTP request durations
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestDuration);

// Middleware to track request durations
fastify.addHook('onRequest', async (request, reply) => {
  request.startTimer = httpRequestDuration.startTimer({
    method: request.method,
    route: request.routerPath || 'unknown',
  });
});

fastify.addHook('onResponse', async (request, reply) => {
  if (request.startTimer) {
    request.startTimer({ status: reply.statusCode });
  }
});
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
fastify.register(paymentRoutes);

// healthcheck
fastify.get('/', async (request, reply) => {
  reply.send({ status: 'ok', message: 'Service is running' });
});
// metrics
fastify.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', register.contentType);
  return register.metrics();
});

// Start Server
const startServer = async () => {
  try {
    await connectQueue();
    logger.info('RabbitMQ connected.');
    // Start the Fastify server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    logger.fatal('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();