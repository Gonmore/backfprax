import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import onboardingController from '../controllers/onboardingController.js';

const router = express.Router();

// ⚠️ RUTA DE PRUEBA SIN AUTENTICACIÓN
router.get('/test', (req, res) => {
    console.log('🎯 Test route called!');
    res.json({ 
        success: true, 
        message: 'Onboarding routes working!',
        timestamp: new Date()
    });
});

/**
 * @swagger
 * /api/onboarding/status:
 *   get:
 *     summary: Verificar estado del onboarding del usuario
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado del onboarding
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OnboardingStatus'
 */
// ⚠️ SOLO UNA RUTA /status CON AUTENTICACIÓN
router.get('/status', authenticateJWT, onboardingController.checkStatus);

/**
 * @swagger
 * /api/onboarding/next-step:
 *   get:
 *     summary: Obtener siguiente paso del onboarding
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Siguiente paso del onboarding
 */
router.get('/next-step', authenticateJWT, onboardingController.getNextStep);

/**
 * @swagger
 * /api/onboarding/complete-step:
 *   post:
 *     summary: Marcar paso como completado
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               step:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paso completado exitosamente
 */
router.post('/complete-step', authenticateJWT, onboardingController.completeStep);

/**
 * @swagger
 * /api/onboarding/recommended-offers:
 *   get:
 *     summary: Obtener ofertas recomendadas para estudiante
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ofertas recomendadas
 */
router.get('/recommended-offers', authenticateJWT, onboardingController.getRecommendedOffers);

export default router;