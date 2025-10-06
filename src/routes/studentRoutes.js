import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import studentController from '../controllers/studentController.js';

const router = express.Router();

// 🔥 RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con parámetros)
router.get('/candidates', authenticateJWT, studentController.getCandidates);
router.post('/search-intelligent', authenticateJWT, studentController.searchIntelligentStudents);
router.get('/tokens/balance', authenticateJWT, studentController.getTokenBalance);
router.post('/tokens/use', authenticateJWT, studentController.useTokens);
router.get('/revealed-cvs', authenticateJWT, studentController.getRevealedCVs);
router.get('/revealed-candidates', authenticateJWT, studentController.getRevealedCandidates); // Nueva ruta agregada

// 🔥 RUTAS PARA GESTIÓN DE PROFAMILY DE ESTUDIANTES
router.get('/profamily', authenticateJWT, studentController.getStudentProfamily);
router.put('/profamily', authenticateJWT, studentController.updateStudentProfamily);

// 🔥 RUTAS PARA GESTIÓN DE SCENTER DE ESTUDIANTES
router.get('/scenter', authenticateJWT, studentController.getStudentScenter);
router.put('/scenter', authenticateJWT, studentController.updateStudentScenter);

// 🔥 RUTAS PARA GESTIÓN DE PERFIL PROFESIONAL COMPLETO
router.get('/professional-profile', authenticateJWT, studentController.getStudentProfessionalProfile);
router.put('/professional-profile', authenticateJWT, studentController.updateStudentProfessionalProfile);

// 🔥 RUTA PARA SUBIR FOTO DE ESTUDIANTE
router.put('/:studentId/photo', authenticateJWT, studentController.uploadStudentPhoto);

// 🔥 RUTAS EXISTENTES GENERALES
router.get('/', authenticateJWT, studentController.getAllStudents);
router.get('/me', authenticateJWT, studentController.getCurrentStudent);

// 🔥 RUTAS CON PARÁMETROS AL FINAL
router.post('/:studentId/view-cv', (req, res, next) => {
  console.log('🔍 RUTA /view-cv llamada para estudiante:', req.params.studentId);
  console.log('🔍 BODY recibido:', req.body);
  next();
}, authenticateJWT, studentController.viewStudentCV);

router.post('/:studentId/contact', (req, res, next) => {
  console.log('🔍 RUTA /contact llamada para estudiante:', req.params.studentId);
  console.log('🔍 BODY recibido:', req.body);
  next();
}, authenticateJWT, studentController.contactStudent);

router.get('/:id', authenticateJWT, studentController.getStudentById);
router.put('/:id', authenticateJWT, studentController.updateStudent);

export default router;