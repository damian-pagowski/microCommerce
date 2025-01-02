const fp = require('fastify-plugin');
const client = require('prom-client');

const metricsPlugin = async (fastify, options) => {
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
  });
  register.registerMetric(httpRequestDuration);

  fastify.decorate('metricsRegister', register);

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

  fastify.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', register.contentType);
    return register.metrics();
  });
};

module.exports = fp(metricsPlugin);