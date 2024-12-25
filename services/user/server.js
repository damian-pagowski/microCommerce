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

const corsPlugin = require('./shared/plugins/cors');
const mongoosePlugin = require('./shared/plugins/mongoose');
const fastifyJWT = require('fastify-jwt');
const userRoutes = require('./routes/userRoutes');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const PORT = process.env.PORT || 3035;

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
fastify.register(userRoutes);

// healthcheck
fastify.get('/', async (request, reply) => {
  reply.send({ status: 'ok', message: 'Service is running' });
});

// Start Server
const startServer = async () => {
  try {   
    // Start the Fastify server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    logger.fatal('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();