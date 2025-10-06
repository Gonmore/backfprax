import express from 'express';
import studentSkillController from '../controllers/studentSkillController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/student-skills/{studentId}/skills:
 *   get:
 *     summary: Obtener todas las skills de un estudiante
 *     tags: [Student Skills]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Lista de skills del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studentId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       proficiencyLevel:
 *                         type: string
 *                         enum: [beginner, intermediate, advanced, expert]
 *                       yearsOfExperience:
 *                         type: number
 *                       isVerified:
 *                         type: boolean
 *                       certificationUrl:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       addedAt:
 *                         type: string
 *                         format: date-time
 *                 totalSkills:
 *                   type: integer
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:studentId/skills', authenticateJWT, studentSkillController.getStudentSkills);

/**
 * @swagger
 * /api/students/{studentId}/skills:
 *   post:
 *     summary: Agregar una skill a un estudiante
 *     tags: [Student Skills]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
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
 *                 enum: [beginner, intermediate, advanced, expert]
 *                 default: beginner
 *               yearsOfExperience:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *               certificationUrl:
 *                 type: string
 *                 format: uri
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Skill agregada exitosamente
 *       404:
 *         description: Estudiante o skill no encontrada
 *       409:
 *         description: El estudiante ya tiene esta skill
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:studentId/skills', authenticateJWT, studentSkillController.addStudentSkill);

/**
 * @swagger
 * /api/students/{studentId}/skills/{skillId}:
 *   put:
 *     summary: Actualizar una skill de un estudiante
 *     tags: [Student Skills]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proficiencyLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *               yearsOfExperience:
 *                 type: number
 *                 minimum: 0
 *               certificationUrl:
 *                 type: string
 *                 format: uri
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Skill actualizada exitosamente
 *       404:
 *         description: Relación estudiante-skill no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:studentId/skills/:skillId', authenticateJWT, studentSkillController.updateStudentSkill);

/**
 * @swagger
 * /api/students/{studentId}/skills/{skillId}:
 *   delete:
 *     summary: Eliminar una skill de un estudiante
 *     tags: [Student Skills]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill
 *     responses:
 *       200:
 *         description: Skill eliminada exitosamente
 *       404:
 *         description: Relación estudiante-skill no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:studentId/skills/:skillId', authenticateJWT, studentSkillController.removeStudentSkill);

/**
 * @swagger
 * /api/students/{studentId}/skills/available:
 *   get:
 *     summary: Obtener skills disponibles para agregar a un estudiante
 *     tags: [Student Skills]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Lista de skills disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studentId:
 *                   type: integer
 *                 availableSkills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       description:
 *                         type: string
 *                       demandLevel:
 *                         type: string
 *                 totalAvailable:
 *                   type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:studentId/skills/available', authenticateJWT, studentSkillController.getAvailableSkills);

/**
 * @swagger
 * /api/students/{studentId}/skills/{skillId}/verify:
 *   patch:
 *     summary: Verificar una skill de estudiante (solo tutores/administradores)
 *     tags: [Student Skills]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVerified:
 *                 type: boolean
 *                 default: true
 *               verificationNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Skill verificada exitosamente
 *       404:
 *         description: Relación estudiante-skill no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:studentId/skills/:skillId/verify', authenticateJWT, studentSkillController.verifyStudentSkill);

export default router;