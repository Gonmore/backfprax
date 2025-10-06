// userCompanyRoutes.js
import { Router } from 'express';
import { createUserCompany, getUserCompaniesByUserId } from '../controllers/userCompanyController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Obtener empresas asociadas a un usuario
router.get('/user/:userId', authenticateJWT, getUserCompaniesByUserId);

// Crear relación usuario-empresa
router.post('/', authenticateJWT, createUserCompany);

export default router;
