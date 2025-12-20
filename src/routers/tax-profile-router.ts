import { Router } from 'express';
import TaxProfileController from '../controllers/tax-profile-controller.js';
import { isAuth } from '../middlewares/is-auth.js';
import { validateRequest } from '../middlewares/req-validation.js';
import { saveValidation } from '../utils/validators/tax-profile-validators.js';

const router = Router();

router.get('/', isAuth, TaxProfileController.getTaxProfiles);
router.get('/:id', isAuth, TaxProfileController.getTaxProfile);
router.post('/', isAuth, saveValidation, validateRequest, TaxProfileController.createTaxProfile);
router.put('/:id', isAuth, saveValidation, validateRequest, TaxProfileController.updateTaxProfile);
router.delete('/:id', isAuth, TaxProfileController.deleteTaxProfile);

export default router;