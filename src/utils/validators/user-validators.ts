import { body } from 'express-validator';
import { INVALID_EMAIL } from '../constants.js';

export const signupValidation = [
  body('email')
    .isEmail()
    .withMessage(INVALID_EMAIL),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage(INVALID_EMAIL),
];

export const updateValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage(INVALID_EMAIL),
  body('password')
    .optional()
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long.'),
  body('birthDate')
    .optional()
    .isDate()
    .withMessage('Birth date must be a valid date.'),
];