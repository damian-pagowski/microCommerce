const fastify = require('fastify');
const userRoutes = require('../../routes/userRoutes');
const { registerUser, loginUser, getUserDetails, deleteUser } = require('../../services/userService');
const { ValidationError } = require('../../shared/utils/errors');

jest.mock('../../services/userService'); 

describe('User Routes', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    app.decorate('authenticate', async (req) => {
      req.user = { username: 'damian12345678' }; 
    });
    app.register(userRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users/register', () => {
    it('should register a user with valid data', async () => {
      const mockResponse = {
        username: 'qwertyuioasdfghjkdfghjk',
        email: 'damian12345678fdfdsfsdfsdfdf@example.com',
        token: 'fake-jwt-token',
      };

      registerUser.mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'POST',
        url: '/users/register',
        payload: {
          username: 'qwertyuioasdfghjkdfghjk',
          email: 'damian12345678fdfdsfsdfsdfdf@example.com',
          password: 'securePassword123',
        },
      });

      expect(response.statusCode).toBe(201);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual(mockResponse);
      expect(registerUser).toHaveBeenCalledWith(
        'qwertyuioasdfghjkdfghjk',
        'damian12345678fdfdsfsdfsdfdf@example.com',
        'securePassword123'
      );
    });

    it('should return 400 for already existing user', async () => {
      registerUser.mockRejectedValue(
        new ValidationError('Username or email already exists', ['username', 'email'])
      );

      const response = await app.inject({
        method: 'POST',
        url: '/users/register',
        payload: {
          username: 'existingUser',
          email: 'existing@example.com',
          password: 'securePassword123',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('message', 'Username or email already exists');
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user with valid credentials', async () => {
      const mockResponse = {
        username: 'damian12345678',
        email: 'damian12345678@example.com',
        token: 'fake-jwt-token',
      };

      loginUser.mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'POST',
        url: '/users/login',
        payload: {
          username: 'damian12345678',
          password: 'securePassword123',
        },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual(mockResponse);
      expect(loginUser).toHaveBeenCalledWith('damian12345678', 'securePassword123');
    });

    it('should return 400 for invalid credentials', async () => {
      loginUser.mockRejectedValue(new ValidationError('Invalid username or password'));

      const response = await app.inject({
        method: 'POST',
        url: '/users/login',
        payload: {
          username: 'invalidUser',
          password: 'wrongPassword',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('message', 'Invalid username or password');
    });
  });

  describe('GET /users/me', () => {
    it('should return user details for authenticated user', async () => {
      const mockResponse = {
        username: 'damian12345678',
        email: 'damian12345678@example.com',
        role: 'user',
        createdAt: '2024-12-27T11:15:51.543Z',
        updatedAt: '2024-12-27T11:15:51.543Z',
      };

      getUserDetails.mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'GET',
        url: '/users/me',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual(mockResponse);
      expect(getUserDetails).toHaveBeenCalledWith('damian12345678');
    });
  });

  describe('DELETE /users/me', () => {
    it('should delete an authenticated user', async () => {
      deleteUser.mockResolvedValue();

      const response = await app.inject({
        method: 'DELETE',
        url: '/users/me',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({ message: 'User deleted successfully' });
      expect(deleteUser).toHaveBeenCalledWith('damian12345678');
    });
  });
});