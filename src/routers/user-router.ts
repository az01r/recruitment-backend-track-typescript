import { Router } from 'express';
import UserController from '../controllers/user-controller.js';
import { isAuth } from '../middlewares/is-auth.js';
import { validateRequest } from '../middlewares/req-validation.js';
import { signupValidation, loginValidation, updateValidation } from '../utils/validators/user-validators.js';

const router = Router();

router.post('/signup', signupValidation, validateRequest, UserController.signup);
router.post('/login', loginValidation, validateRequest, UserController.login);
router.get('/', isAuth, UserController.getUser);
router.put('/', isAuth, updateValidation, validateRequest, UserController.updateUser);
router.delete('/', isAuth, UserController.deleteUser);

export default router;