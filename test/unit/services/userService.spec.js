const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../../src/models/user');
const { registerUser, loginUser, getUserDetails, deleteUser } = require('../../../src/services/userService');
const { ValidationError, UnauthorizedError, NotFoundError } = require('../../../src/utils/errors');

jest.mock('../../../src/models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a user and return a token', async () => {
      const user = { username: 'testuser', email: 'testuser@example.com', password: 'hashedpassword' };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(user.password);
      User.prototype.save = jest.fn().mockResolvedValue(user);
      jwt.sign.mockReturnValue('mocked_token');

      const result = await registerUser(user.username, user.email, 'password123');
      expect(result).toEqual({ username: user.username, email: user.email, token: 'mocked_token' });
      expect(User.findOne).toHaveBeenCalledWith({ $or: [{ username: user.username }, { email: user.email }] });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ValidationError if username or email already exists', async () => {
      User.findOne.mockResolvedValue({ username: 'existinguser' });

      await expect(registerUser('existinguser', 'test@example.com', 'password')).rejects.toThrow(ValidationError);
    });
  });

  describe('loginUser', () => {
    it('should log in a user and return a token', async () => {
      const user = { username: 'testuser', email: 'testuser@example.com', password: 'hashedpassword' };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked_token');

      const result = await loginUser(user.username, 'password123');
      expect(result).toEqual({ username: user.username, email: user.email, token: 'mocked_token' });
      expect(User.findOne).toHaveBeenCalledWith({ username: user.username });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
    });

    it('should throw NotFoundError if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(loginUser('unknownuser', 'password')).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      const user = { username: 'testuser', password: 'hashedpassword' };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await expect(loginUser('testuser', 'wrongpassword')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getUserDetails', () => {
    it('should return user details', async () => {
      const user = { username: 'testuser', email: 'testuser@example.com' };
      User.findOne.mockResolvedValue(user);

      const result = await getUserDetails(user.username);
      expect(result).toEqual(user);
      expect(User.findOne).toHaveBeenCalledWith({ username: user.username }, { password: 0, _id: 0, __v: 0 });
    });

    it('should throw NotFoundError if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(getUserDetails('unknownuser')).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      User.findOneAndDelete.mockResolvedValue({ username: 'testuser' });

      await expect(deleteUser('testuser')).resolves.not.toThrow();
      expect(User.findOneAndDelete).toHaveBeenCalledWith({ username: 'testuser' });
    });

    it('should throw NotFoundError if user is not found', async () => {
      User.findOneAndDelete.mockResolvedValue(null);

      await expect(deleteUser('unknownuser')).rejects.toThrow(NotFoundError);
    });
  });
});