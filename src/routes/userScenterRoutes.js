// userScenterRoutes.js
import { Router } from 'express';
import { createUserScenter, getUserScentersByUserId } from '../controllers/userScenterController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Obtener centros asociados a un usuario
router.get('/user/:userId', authenticateJWT, getUserScentersByUserId);

// Crear relación usuario-centro
router.post('/', authenticateJWT, createUserScenter);

export default router;