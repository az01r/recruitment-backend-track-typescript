import { Router } from 'express';
import UserController from '../controllers/user-controller.js';
import { isAuth } from '../middlewares/is-auth.js';

const router = Router();

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/', isAuth, UserController.getUser);
router.put('/', isAuth, UserController.updateUser);
router.delete('/', isAuth, UserController.deleteUser);

export default router;