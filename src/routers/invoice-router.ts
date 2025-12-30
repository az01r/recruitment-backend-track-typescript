import { Router } from 'express';
import InvoiceController from '../controllers/invoice-controller.js';
import { isAuth } from '../middlewares/is-auth.js';
import { validateRequest } from '../middlewares/request-validation.js';
import { readValidation, saveInvoiceValidation, updateInvoiceValidation } from '../utils/validators/invoice-validators.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the invoice
 *         taxProfileId:
 *           type: string
 *           description: The tax profile id association
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The invoice creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The invoice last update date
 *         amount:
 *           type: number
 *           description: The invoice amount
 *         status:
 *           type: string
 *           description: The invoice status. Possible values [ PAID, PENDING, FAILED ]
 *         currency:
 *           type: string
 *           description: The invoice currency. Possible values [ EUR, USD, GBP ]
 *       example:
 *         id: d5fE_asz
 *         taxProfileId: asd151
 *         createdAt: 2023-10-01T12:00:00Z
 *         amount: 100.50
 *         status: PAID
 *         currency: EUR
 */

/**
 * @swagger
 * /invoice:
 *   get:
 *     summary: Returns the list of invoices of the logged user or the invoices of a specific tax profile
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skip
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Skip the first n invoices
 *       - name: take
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: Take the next n invoices
 *       - name: taxProfileId
 *         in: query
 *         required: false
 *         description: Filter by tax profile id
 *       - name: amount
 *         in: query
 *         schema:
 *           type: number
 *         required: false
 *         description: Filter by amount
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum:
 *             - PAID
 *             - PENDING
 *             - FAILED
 *         required: false
 *         description: Filter by status
 *       - name: currency
 *         in: query
 *         schema:
 *           type: string
 *           enum:
 *             - EUR
 *             - USD
 *             - GBP
 *         required: false
 *         description: Filter by currency
 *       - name: gteCreatedAt
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-12-01T00:00:00.000Z
 *       - name: lteCreatedAt
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-12-30T00:00:00.000Z
 *       - name: gteUpdatedAt
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-12-01T00:00:00.000Z
 *       - name: lteUpdatedAt
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-12-30T00:00:00.000Z
 *     responses:
 *       200:
 *         description: The list of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 */
router.get('/', isAuth, readValidation, validateRequest, InvoiceController.getInvoices);

/**
 * @swagger
 * /invoice/{id}:
 *   get:
 *     summary: Get an invoice by id
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     responses:
 *       200:
 *         description: The invoice description by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice does not exist or does not belong to user
 */
router.get('/:id', isAuth, InvoiceController.getInvoice);

/**
 * @swagger
 * /invoice:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taxProfileId
 *               - amount
 *               - status
 *               - currency
 *             properties:
 *               taxProfileId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 100.50
 *               status:
 *                 type: string
 *                 example: PAID
 *                 enum:
 *                   - PAID
 *                   - PENDING
 *                   - FAILED
 *               currency:
 *                 type: string
 *                 example: EUR
 *                 enum:
 *                   - EUR
 *                   - USD
 *                   - GBP
 *     responses:
 *       201:
 *         description: The invoice was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax profile does not exist or does not belong to user
 *       422:
 *         description: Validation error
 */
router.post('/', isAuth, saveInvoiceValidation, validateRequest, InvoiceController.createInvoice);

/**
 * @swagger
 * /invoice/{id}:
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 100.50
 *               status:
 *                 type: string
 *                 example: PAID
 *                 enum:
 *                   - PAID
 *                   - PENDING
 *                   - FAILED
 *               currency:
 *                 type: string
 *                 example: EUR
 *                 enum:
 *                   - EUR
 *                   - USD
 *                   - GBP
 *     responses:
 *       200:
 *         description: The invoice was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice does not exist or does not belong to user.
 *       422:
 *         description: Validation error
 */
router.put('/:id', isAuth, updateInvoiceValidation, validateRequest, InvoiceController.updateInvoice);

/**
 * @swagger
 * /invoice/{id}:
 *   delete:
 *     summary: Remove the invoice by id
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     responses:
 *       200:
 *         description: The invoice was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invoice deleted.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice does not exist or does not belong to user.
 */
router.delete('/:id', isAuth, InvoiceController.deleteInvoice);

export default router;