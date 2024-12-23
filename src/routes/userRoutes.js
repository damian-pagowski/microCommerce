const fastifyPlugin = require('fastify-plugin');
const { registerUser, loginUser, getUserDetails, deleteUser } = require('../services/userService');
const { registerSchema, loginSchema } = require('../validation/userValidation');

async function userRoutes(fastify, opts) {
    fastify.post('/users/register', { schema: registerSchema }, async (req, reply) => {
        const { username, email, password } = req.body;
        const result = await registerUser(username, email, password);
        reply.status(201).send(result);
    });

    fastify.post('/users/login', { schema: loginSchema }, async (req, reply) => {
        const { username, password } = req.body;
        const result = await loginUser(username, password);
        reply.status(200).send(result);
    });

    fastify.get('/users/me', { preHandler: [fastify.authenticate] }, async (req, reply) => {
        const { username } = req.user;
        const result = await getUserDetails(username);
        reply.status(200).send(result);
    });

    fastify.delete('/users/me', { preHandler: [fastify.authenticate] }, async (req, reply) => {
        const { username } = req.user;
        await deleteUser(username);
        reply.status(200).send({ message: 'User deleted successfully' });
    });
}

module.exports = fastifyPlugin(userRoutes);