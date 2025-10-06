import express from 'express';
import academicVerificationController from '../controllers/academicVerificationController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

// Estudiantes: enviar solicitud de verificación
router.post('/', academicVerificationController.submitAcademicVerification);

// Estudiantes: ver estado de sus verificaciones
router.get('/status', academicVerificationController.getVerificationStatus);

// Centros de estudios: ver todas las verificaciones de su centro
router.get('/scenter', academicVerificationController.getScenterVerifications);

// Centros de estudios: revisar verificación (aprobar/rechazar)
router.put('/:verificationId/review', academicVerificationController.reviewVerification);

export default router;