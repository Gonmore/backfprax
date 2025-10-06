import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import * as validationController from '../controllers/validationController.js';

const router = express.Router();

// Rutas para validación con IA
router.post('/validate-scenter', authenticateJWT, validationController.validateScenter);
router.post('/validate-profamily', authenticateJWT, validationController.validateProfamily);

export default router;