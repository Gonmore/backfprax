import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import scenterController from '../controllers/scenterController.js';

const router = express.Router();

// Rutas públicas para estudiantes (solo scenters activos)
router.get('/active', scenterController.getActiveScenters);
router.get('/:id', scenterController.getScenterById);

// Rutas protegidas para gestión de scenters (solo admin)
router.post('/', authenticateJWT, scenterController.createScenter);
router.put('/:id', authenticateJWT, scenterController.updateScenter);
router.patch('/:id/status', authenticateJWT, scenterController.toggleScenterStatus);

// Rutas para gestión de profamilys en scenters (solo admin)
router.post('/:scenterId/profamilys', authenticateJWT, scenterController.addProfamilyToScenter);
router.delete('/:scenterId/profamilys/:profamilyId', authenticateJWT, scenterController.removeProfamilyFromScenter);
router.get('/:scenterId/profamilys/available', authenticateJWT, scenterController.getAvailableProfamilysForScenter);

// Rutas para usuarios asociados a scenters
router.get('/user/me', authenticateJWT, scenterController.getUserScenters);

export default router;