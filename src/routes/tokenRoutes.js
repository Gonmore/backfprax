import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import { searchIntelligentStudents, getTokenBalance } from '../controllers/studentController.js';

console.log('🎯 ===== tokenRoutes.js CARGADO =====');

const router = Router();

// Rutas para gestión de tokens
router.route('/balance')
    .get(authenticateJWT, getTokenBalance);  // Obtener balance de tokens

router.route('/search-students')
    .post(authenticateJWT, searchIntelligentStudents);  // 🔥 Búsqueda inteligente de estudiantes

export default router;
