import { Router } from 'express';
import TaxProfileController from '../controllers/tax-profile-controller.js';
import { isAuth } from '../middlewares/is-auth.js';
import { validateRequest } from '../middlewares/request-validation.js';
import { createValidation, updateValidation } from '../utils/validators/tax-profile-validators.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaxProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the tax profile
 *         userId:
 *           type: string
 *           description: The user id association
 *         legalName:
 *           type: string
 *           description: The legal name of the entity
 *         vatNumber:
 *           type: string
 *           description: The VAT number
 *         address:
 *           type: string
 *           description: The address
 *         city:
 *           type: string
 *           description: The city
 *         zipCode:
 *           type: string
 *           description: The zip code
 *         country:
 *           type: string
 *           description: The country
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The tax profile creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The tax profile last update date
 *       example:
 *         id: d5fE_asz
 *         userId: userId1234
 *         legalName: Acme Corp
 *         vatNumber: IT12345678901
 *         address: Via Roma 1
 *         city: Turin
 *         zipCode: 00100
 *         country: Italy
 */

/**
 * @swagger
 * /tax-profile:
 *   get:
 *     summary: Returns the list of all tax profiles for the user
 *     tags: [TaxProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skip
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: take
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: legalName
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: vatNumber
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: city
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: country
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: zipCode
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The list of tax profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taxProfiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaxProfile'
 *       401:
 *         description: Unauthorized
 */
router.get('/', isAuth, TaxProfileController.getTaxProfiles);

/**
 * @swagger
 * /tax-profile/{id}:
 *   get:
 *     summary: Get a tax profile by id
 *     tags: [TaxProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tax profile id
 *     responses:
 *       200:
 *         description: The tax profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taxProfile:
 *                   $ref: '#/components/schemas/TaxProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax profile does not exist or does not belong to user
 */
router.get('/:id', isAuth, TaxProfileController.getTaxProfile);

/**
 * @swagger
 * /tax-profile:
 *   post:
 *     summary: Create a new tax profile
 *     tags: [TaxProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - legalName
 *               - vatNumber
 *               - address
 *               - city
 *               - zipCode
 *               - country
 *             properties:
 *               legalName:
 *                 type: string
 *                 example: Multidialogo
 *               vatNumber:
 *                 type: string
 *                 example: IT01234567890
 *               address:
 *                 type: string
 *                 example: Via Roma 1
 *               city:
 *                 type: string
 *                 example: Turin
 *               zipCode:
 *                 type: string
 *                 example: 10123
 *               country:
 *                 type: string
 *                 example: Italy
 *     responses:
 *       201:
 *         description: The tax profile was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taxProfile:
 *                   $ref: '#/components/schemas/TaxProfile'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/', isAuth, createValidation, validateRequest, TaxProfileController.createTaxProfile);

/**
 * @swagger
 * /tax-profile/{id}:
 *   put:
 *     summary: Update a tax profile
 *     tags: [TaxProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tax profile id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               legalName:
 *                 type: string
 *                 example: Multidialogo
 *               vatNumber:
 *                 type: string
 *                 example: IT01234567890
 *               address:
 *                 type: string
 *                 example: Via Roma 1
 *               city:
 *                 type: string
 *                 example: Turin
 *               zipCode:
 *                 type: string
 *                 example: 10123
 *               country:
 *                 type: string
 *                 example: Italy
 *     responses:
 *       200:
 *         description: The tax profile was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taxProfile:
 *                   $ref: '#/components/schemas/TaxProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax profile does not exist or does not belong to user
 *       422:
 *         description: Validation error
 */
router.put('/:id', isAuth, updateValidation, validateRequest, TaxProfileController.updateTaxProfile);

/**
 * @swagger
 * /tax-profile/{id}:
 *   delete:
 *     summary: Remove the tax profile by id
 *     tags: [TaxProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tax profile id
 *     responses:
 *       200:
 *         description: Tax profile deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tax profile deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax profile does not exist or does not belong to user
 */
router.delete('/:id', isAuth, TaxProfileController.deleteTaxProfile);

export default router;