import { Router } from 'express'
import tutorController from '../controllers/tutorController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Rutas principales para tutores
router.route('/')
    .get(tutorController.listTutors)  // Listar todos los tutores (público)
    .post(authenticateJWT, tutorController.createTutor);  // Crear nuevo tutor (autenticado)

router.route('/:id')
    .get(tutorController.getTutor)  // Obtener tutor específico (público)
    .put(authenticateJWT, tutorController.updateTutor)  // Actualizar tutor (autenticado)
    .delete(authenticateJWT, tutorController.deleteTutor);  // Eliminar tutor (autenticado)

// Rutas adicionales para relaciones
router.route('/scenter/:scenterId')
    .get(tutorController.getTutorsByScenter);  // Obtener tutores por centro de estudios

router.route('/profamily/:profamilyId')
    .get(tutorController.getTutorsByProfamily);  // Obtener tutores por familia profesional

export default router
