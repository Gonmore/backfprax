import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import cvController from '../controllers/cvController.js';

const router = express.Router();

// Middleware para logging
const logRequest = (req, res, next) => {
    console.log(`🔍 CV Route: ${req.method} ${req.path}`);
    next();
};

router.use(logRequest);

// 🔥 RUTAS PARA GESTIÓN DE CV DE ESTUDIANTES

/**
 * @swagger
 * /api/cv/my-cv:
 *   get:
 *     summary: Obtener el CV completo del estudiante actual
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CV completo del estudiante
 *       404:
 *         description: Estudiante o CV no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/my-cv', authenticateJWT, cvController.getMyCv);

/**
 * @swagger
 * /api/cv/student/{userId}:
 *   get:
 *     summary: Obtener el CV completo del estudiante por userId (para compatibilidad con frontend)
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario estudiante
 *     responses:
 *       200:
 *         description: CV completo del estudiante
 *       404:
 *         description: Estudiante o CV no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/student/:userId', authenticateJWT, cvController.getStudentCvByUserId);

/**
 * @swagger
 * /api/cv:
 *   post:
 *     summary: Crear o actualizar el CV del estudiante
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del CV
 *               summary:
 *                 type: string
 *                 description: Resumen profesional
 *               contactEmail:
 *                 type: string
 *                 description: Email de contacto
 *               contactPhone:
 *                 type: string
 *                 description: Teléfono de contacto
 *               file:
 *                 type: string
 *                 description: Ruta al archivo PDF
 *               availability:
 *                 type: string
 *                 enum: [immediate, 1_month, 3_months, 6_months, flexible]
 *               workPreferences:
 *                 type: object
 *                 description: Preferencias laborales
 *     responses:
 *       200:
 *         description: CV guardado exitosamente
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticateJWT, cvController.createOrUpdateCv);

/**
 * @swagger
 * /api/cv/complete:
 *   post:
 *     summary: Marcar el CV como completo después de validación
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CV marcado como completo
 *       400:
 *         description: CV incompleto (faltan datos requeridos)
 *       404:
 *         description: CV no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/complete', authenticateJWT, cvController.markCvComplete);

/**
 * @swagger
 * /api/cv/skills:
 *   post:
 *     summary: Agregar una skill al CV del estudiante
 *     tags: [CV Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skillId
 *             properties:
 *               skillId:
 *                 type: integer
 *                 description: ID de la skill a agregar
 *               proficiencyLevel:
 *                 type: string
 *                 enum: [bajo, medio, alto]
 *                 default: medio
 *               yearsOfExperience:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *               isHighlighted:
 *                 type: boolean
 *                 default: false
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Skill agregada exitosamente
 *       400:
 *         description: Skill ya existe en el CV
 *       404:
 *         description: CV o skill no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/skills', authenticateJWT, cvController.addSkillToCv);

/**
 * @swagger
 * /api/cv/skills/{cvSkillId}:
 *   put:
 *     summary: Actualizar una skill en el CV del estudiante
 *     tags: [CV Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvSkillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación cv-skill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proficiencyLevel:
 *                 type: string
 *                 enum: [bajo, medio, alto]
 *               yearsOfExperience:
 *                 type: integer
 *                 minimum: 0
 *               isHighlighted:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Skill actualizada exitosamente
 *       404:
 *         description: Skill no encontrada en el CV
 *       500:
 *         description: Error interno del servidor
 */
router.put('/skills/:cvSkillId', authenticateJWT, cvController.updateCvSkill);

/**
 * @swagger
 * /api/cv/skills/{cvSkillId}:
 *   delete:
 *     summary: Quitar una skill del CV del estudiante
 *     tags: [CV Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvSkillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación cv-skill a eliminar
 *     responses:
 *       200:
 *         description: Skill removida exitosamente
 *       404:
 *         description: Skill no encontrada en el CV
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/skills/:cvSkillId', authenticateJWT, cvController.removeSkillFromCv);

// 🔥 RUTAS PARA EMPRESAS (ACCESO CON TOKENS)

/**
 * @swagger
 * /api/cv/{cvId}/view:
 *   get:
 *     summary: Ver CV completo (requiere tokens)
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cvId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del CV
 *     responses:
 *       200:
 *         description: CV completo visible
 *       403:
 *         description: No tiene suficientes tokens
 *       404:
 *         description: CV no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:cvId/view', authenticateJWT, cvController.getCvForCompany);

export default router;