import { Router } from 'express';
import debugController from '../controllers/debugController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

router.get('/user-company-mapping', authenticateJWT, debugController.debugUserCompanyMapping);

export default router;
