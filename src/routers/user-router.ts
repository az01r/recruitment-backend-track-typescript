import { Router } from 'express';
import UserController from '../controllers/user-controller.js';
import { isAuth } from '../middlewares/is-auth.js';
import { validateRequest } from '../middlewares/request-validation.js';
import { signupValidation, loginValidation, updateValidation } from '../utils/validators/user-validators.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The user email
 *         firstName:
 *           type: string
 *           description: The user first name
 *         lastName:
 *           type: string
 *           description: The user last name
 *         birthDate:
 *           type: string
 *           format: date
 *           description: The user birth date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The user creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The user last update date
 *       example:
 *         id: d5fE_asz
 *         email: test@test.com
 *         firstName: John
 *         lastName: Doe
 *         birthDate: 1990-01-01
 */

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example: testtest
 *     responses:
 *       201:
 *         description: Signed up.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 jwt:
 *                   type: string
 *       409:
 *         description: User already registered.
 *       422:
 *         description: Validation error
 */
router.post('/signup', signupValidation, validateRequest, UserController.signup);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example: testtest
 *     responses:
 *       200:
 *         description: Logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 jwt:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *       422:
 *         description: Validation error
 */
router.post('/login', loginValidation, validateRequest, UserController.login);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get the logged in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/', isAuth, UserController.getUser);

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Update the logged in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example: testtest
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error
 */
router.put('/', isAuth, updateValidation, validateRequest, UserController.updateUser);

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Delete the logged in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/', isAuth, UserController.deleteUser);

export default router;