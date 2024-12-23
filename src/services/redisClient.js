const redis = require('redis');
require('dotenv').config();

const host = process.env.REDIS_HOST;
const port =  process.env.REDIS_PORT;
const password =  process.env.REDIS_PASSWORD;

const client = redis.createClient({
    username: 'default',
    password: password,
    socket: {
        host: host,
        port: port
    }
});

client.on('error', err => console.log('Redis Client Error', err));


client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
    console.log(`Connected to Redis`);

  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
})();

module.exports = client;