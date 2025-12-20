import { Router } from 'express';
import InvoiceController from '../controllers/invoice-controller.js';
import { isAuth } from '../middlewares/is-auth.js';
import { validateRequest } from '../middlewares/req-validation.js';
import { saveInvoiceValidation, updateInvoiceValidation } from '../utils/validators/invoice-validators.js';

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
 *         taxProfileId: 12345
 *         createdAt: 2023-10-01T12:00:00Z
 *         amount: 100.50
 *         status: PAID
 *         currency: EUR
 */

/**
 * @swagger
 * /invoice:
 *   get:
 *     summary: Returns the list of invoices for the user
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taxProfileId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by tax profile id
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
 */
router.get('/', isAuth, InvoiceController.getUserInvoices);

/**
 * @swagger
 * /invoice/{id}:
 *   get:
 *     summary: Get an invoice by id
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       404:
 *         description: The invoice was not found
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
 *               status:
 *                 type: string
 *               currency:
 *                 type: string
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
 *       404:
 *         description: Tax Profile not found or does not belong to user
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
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *               currency:
 *                 type: string
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
 *       404:
 *         description: Invoice not found or does not belong to user.
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
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     responses:
 *       200:
 *         description: The invoice was deleted
 *       404:
 *         description: Invoice not found or does not belong to user.
 */
router.delete('/:id', isAuth, InvoiceController.deleteInvoice);

export default router;