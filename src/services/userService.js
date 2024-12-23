const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { ValidationError, UnauthorizedError, DatabaseError, NotFoundError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TOKEN_EXPIRATION = '7d';

const registerUser = async (username, email, password) => {
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ValidationError('Username or email already exists', ['username', 'email']);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  const token = generateToken(newUser);
  return { username, email, token };
};

const loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new NotFoundError('User Not Found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const token = generateToken(user);
  return { username: user.username, email: user.email, token };
};

const getUserDetails = async (username) => {
  const user = await User.findOne({ username }, { password: 0, _id: 0, __v: 0 });
  if (!user) {
    throw new NotFoundError('User not found', username);
  }
  return user;
};

const deleteUser = async (username) => {
  const result = await User.findOneAndDelete({ username });
  if (!result) {
    throw new NotFoundError('User', username);
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION, algorithm: 'HS256' }
  );
};

module.exports = { registerUser, loginUser, getUserDetails, deleteUser };