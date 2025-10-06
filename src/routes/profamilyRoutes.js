import { Router } from 'express'
import profamilyController from '../controllers/profamilyController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Rutas principales para familias profesionales
router.route('/')
    .get(profamilyController.listProfamilies)  // Listar todas las familias profesionales (público)
    .post(authenticateJWT, profamilyController.createProfamily);  // Crear nueva familia profesional (autenticado)

router.route('/:id')
    .get(profamilyController.getProfamily)  // Obtener familia profesional específica (público)
    .put(authenticateJWT, profamilyController.updateProfamily)  // Actualizar familia profesional (autenticado)
    .delete(authenticateJWT, profamilyController.deleteProfamily);  // Eliminar familia profesional (autenticado)

// Rutas adicionales para relaciones
router.route('/:id/students')
    .get(profamilyController.getStudentsByProfamily);  // Obtener estudiantes por familia profesional

router.route('/:id/tutors')
    .get(profamilyController.getTutorsByProfamily);  // Obtener tutores por familia profesional

export default router
