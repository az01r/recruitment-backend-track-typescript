import { body } from 'express-validator';

export const createValidation = [
  body('legalName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Legal name must be at least 2 characters long.'),
  body('vatNumber')
    .trim()
    .isLength({ min: 2 })
    .withMessage('VAT number must be at least 2 characters long.'),
  body('address')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Address must be at least 2 characters long.'),
  body('city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters long.'),
  body('zipCode')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Zip code must be at least 2 characters long.'),
  body('country')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Country must be at least 2 characters long.')
];

export const updateValidation = [
  body('legalName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Legal name must be at least 2 characters long.'),
  body('vatNumber')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('VAT number must be at least 2 characters long.'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Address must be at least 2 characters long.'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters long.'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Zip code must be at least 2 characters long.'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Country must be at least 2 characters long.')
];