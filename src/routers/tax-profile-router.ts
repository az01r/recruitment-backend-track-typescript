import { Router } from 'express';
import TaxProfileController from '../controllers/tax-profile-controller.js';
import { isAuth } from '../middlewares/is-auth.js';

const router = Router();

router.get('/', isAuth, TaxProfileController.getTaxProfiles);
router.get('/:id', isAuth, TaxProfileController.getTaxProfile);
router.post('/', isAuth, TaxProfileController.createTaxProfile);
router.put('/:id', isAuth, TaxProfileController.updateTaxProfile);
router.delete('/:id', isAuth, TaxProfileController.deleteTaxProfile);

export default router;