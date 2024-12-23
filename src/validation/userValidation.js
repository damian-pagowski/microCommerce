const Joi = require('joi');

// Registration Schema
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username must be a string.',
    'string.empty': 'Username cannot be empty.',
    'string.min': 'Username must be at least 3 characters long.',
    'string.max': 'Username must be less than or equal to 30 characters.',
    'any.required': 'Username is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string.',
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password must be a string.',
    'string.empty': 'Password cannot be empty.',
    'string.min': 'Password must be at least 6 characters long.',
    'any.required': 'Password is required.',
  }),
});

// Login Schema
const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.base': 'Username must be a string.',
    'string.empty': 'Username cannot be empty.',
    'any.required': 'Username is required.',
  }),
  password: Joi.string().required().messages({
    'string.base': 'Password must be a string.',
    'string.empty': 'Password cannot be empty.',
    'any.required': 'Password is required.',
  }),
});

module.exports = { registerSchema, loginSchema };