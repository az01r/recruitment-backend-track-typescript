import { body, query } from 'express-validator';

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

export const readManyValidation = [
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer.'),
  query('take')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Take must be a positive integer.'),
  query('legalName')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('Legal name must be at least 2 characters long.'),
  query('vatNumber')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('VAT number must be at least 2 characters long.'),
  query('address')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('Address must be at least 2 characters long.'),
  query('city')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters long.'),
  query('country')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('Country must be at least 2 characters long.'),
  query('zipCode')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('Zip code must be at least 2 characters long.'),
  query('gteCreatedAt')
    .optional()
    .isISO8601()
    .withMessage('gteCreatedAt must be a valid ISO8601 date')
    .toDate(),
  query('lteCreatedAt')
    .optional()
    .isISO8601()
    .withMessage('lteCreatedAt must be a valid ISO8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (req.query!.gteCreatedAt) {
        if ((value as Date).getTime() <= new Date(req.query!.gteCreatedAt).getTime()) {
          throw new Error('lteCreatedAt must be after gteCreatedAt');
        }
      }
      return true;
    }),
  query('gteUpdatedAt')
    .optional()
    .isISO8601()
    .withMessage('gteUpdatedAt must be a valid ISO8601 date')
    .toDate(),
  query('lteUpdatedAt')
    .optional()
    .isISO8601()
    .withMessage('lteUpdatedAt must be a valid ISO8601 date')
    .toDate()
    .custom((value, { req }) => {
      if (req.query!.gteUpdatedAt) {
        if ((value as Date).getTime() <= new Date(req.query!.gteUpdatedAt).getTime()) {
          throw new Error('lteUpdatedAt must be after gteUpdatedAt');
        }
      }
      return true;
    }),
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