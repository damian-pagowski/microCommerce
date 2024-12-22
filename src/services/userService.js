const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { ValidationError, UnauthorizedError, DatabaseError, NotFoundError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TOKEN_EXPIRATION = '7d'; // Long-living token for dev

const registerUser = async (username, email, password) => {
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ValidationError('Username or email already exists', ['username', 'email']);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser);
    return { username, email, token };
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new DatabaseError('Failed to register user', error);
  }
};

const loginUser = async (username, password) => {
  try {
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
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to log in user', error);
  }
};

const getUserDetails = async (username) => {
  try {
    const user = await User.findOne({ username }, { password: 0, _id: 0, __v: 0 });
    if (!user) {
      throw new ValidationError('User not found', ['username']);
    }
    return user;
  } catch (error) {
    if (error instanceof ValidationError){
        throw error
    }
    throw new DatabaseError('Failed to retrieve user details', error);
  }
};

const deleteUser = async (username) => {
    try {
        const result = await User.findOneAndDelete({ username });
        if (!result) {
            throw new NotFoundError('User', username);
        }
    } catch (err) {
        throw new DatabaseError(`Failed to delete user: ${username}`, err);
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

module.exports = { registerUser, loginUser, getUserDetails , deleteUser};