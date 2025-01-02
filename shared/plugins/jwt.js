const fp = require('fastify-plugin');
const { UnauthorizedError } = require('../utils/errors');

const jwtPlugin = async (fastify, options) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

  fastify.register(require('fastify-jwt'), {
    secret: JWT_SECRET,
    sign: { algorithm: 'HS256' },
  });

  fastify.decorate('authenticate', async (req, reply) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid token');
      }

      const token = authHeader.split(' ')[1];
      const decoded = fastify.jwt.verify(token);
      req.user = decoded;
    } catch (err) {
      reply.status(401).send({ message: 'Invalid or expired token' });
    }
  });
};

module.exports = fp(jwtPlugin);