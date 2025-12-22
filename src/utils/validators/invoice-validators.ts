import { body } from 'express-validator';

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
