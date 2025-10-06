import { Router } from 'express'
import companyController from '../controllers/companyController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();
router.route('/').get(companyController.getCompanys)
                .post(authenticateJWT, companyController.createCompany)

router.route('/:id').get(authenticateJWT, companyController.getCompany)
                    .put(authenticateJWT, companyController.updateCompany)
                    .patch(authenticateJWT, companyController.activateInactivate)
                    .delete(authenticateJWT, companyController.deleteCompany)
export default router