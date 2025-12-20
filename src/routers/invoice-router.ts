import { Router } from 'express';
import InvoiceController from '../controllers/invoice-controller.js';
import { isAuth } from '../middlewares/is-auth.js';
import { validateRequest } from '../middlewares/req-validation.js';
import { saveInvoiceValidation, updateInvoiceValidation } from '../utils/validators/invoice-validators.js';

const router = Router();

router.get('/', isAuth, InvoiceController.getUserInvoices);
router.get('/:id', isAuth, InvoiceController.getInvoice);
router.post('/', isAuth, saveInvoiceValidation, validateRequest, InvoiceController.createInvoice);
router.put('/:id', isAuth, updateInvoiceValidation, validateRequest, InvoiceController.updateInvoice);
router.delete('/:id', isAuth, InvoiceController.deleteInvoice);

export default router;