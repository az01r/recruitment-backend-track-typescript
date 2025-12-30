import { body, query } from 'express-validator';

export const saveInvoiceValidation = [
  body('taxProfileId')
    .trim()
    .notEmpty()
    .withMessage('Tax Profile ID is required.'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number.')
    .toFloat(),
  body('status')
    .isIn(['PENDING', 'PAID', 'CANCELLED'])
    .withMessage('Status must be one of PENDING, PAID, CANCELLED.'),
  body('currency')
    .isIn(['EUR', 'USD', 'GBP'])
    .withMessage('Currency must be one of EUR, USD, GBP.')
];

export const readValidation = [
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer.'),
  query('take')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Take must be a positive integer.'),
  query('taxProfileId')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('Tax Profile ID must be at least 2 characters long.'),
  query('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number.')
    .toFloat(),
  query('status')
    .optional()
    .isIn(['PENDING', 'PAID', 'CANCELLED'])
    .withMessage('Status must be one of PENDING, PAID, CANCELLED.'),
  query('currency')
    .optional()
    .isIn(['EUR', 'USD', 'GBP'])
    .withMessage('Currency must be one of EUR, USD, GBP.'),
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

export const updateInvoiceValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number.')
    .toFloat(),
  body('status')
    .optional()
    .isIn(['PENDING', 'PAID', 'CANCELLED'])
    .withMessage('Status must be one of PENDING, PAID, CANCELLED.'),
  body('currency')
    .optional()
    .isIn(['EUR', 'USD', 'GBP'])
    .withMessage('Currency must be one of EUR, USD, GBP.')
];
