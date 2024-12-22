const { registerUser, loginUser, getUserDetails } = require('../services/userService');
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
        try {
            const { username } = req.user;    
            const result = await getUserDetails(username);
            reply.status(200).send(result);
        } catch (error) {
            fastify.log.error('Error fetching user details:', error);
            reply.status(500).send({ message: 'Failed to fetch user details' });
        }
    });
    fastify.delete('/users/me', { preHandler: [fastify.authenticate] }, async (req, reply) => {
        const { username } = req.user;
        try {
            await deleteUser(username);
            reply.status(200).send({ message: 'User deleted successfully' });
        } catch (err) {
            reply.status(500).send({ message: 'Error deleting user', error: err.message });
        }
    });
}

module.exports = userRoutes;