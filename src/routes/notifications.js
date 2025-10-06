// Rutas API para notificaciones
import express from 'express';
import { authenticateJWT as authMiddleware } from '../middlewares/authenticate.midlleware.js';
import notificationService from '../services/notificationService.js';
import websocketController from '../controllers/websocketController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         read:
 *           type: boolean
 *         timestamp:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 */

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Enviar notificación de prueba
 *     tags: [Notifications]
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
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notificación enviada
 */
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { title, message, type = 'info', priority = 'medium' } = req.body;
    const userId = req.user.id;

    await notificationService.sendNotificationToUser(userId, {
      title,
      message,
      type,
      priority
    });

    res.json({
      success: true,
      message: 'Notificación de prueba enviada'
    });
  } catch (error) {
    console.error('❌ Error enviando notificación de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando notificación'
    });
  }
});

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Obtener preferencias de notificación del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferencias de notificación
 */
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Obtener preferencias de base de datos
    const defaultPreferences = {
      new_application: true,
      application_accepted: true,
      application_rejected: true,
      interview_request: true,
      company_contact: true,
      relevant_offer: true,
      offer_expiring: true,
      email_notifications: true,
      push_notifications: true
    };

    res.json({
      success: true,
      preferences: defaultPreferences
    });
  } catch (error) {
    console.error('❌ Error obteniendo preferencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo preferencias'
    });
  }
});

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: Actualizar preferencias de notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_application:
 *                 type: boolean
 *               application_accepted:
 *                 type: boolean
 *               application_rejected:
 *                 type: boolean
 *               interview_request:
 *                 type: boolean
 *               company_contact:
 *                 type: boolean
 *               relevant_offer:
 *                 type: boolean
 *               offer_expiring:
 *                 type: boolean
 *               email_notifications:
 *                 type: boolean
 *               push_notifications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferencias actualizadas
 */
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    notificationService.setUserNotificationPreferences(userId, preferences);
    
    // TODO: Guardar en base de datos
    
    res.json({
      success: true,
      message: 'Preferencias actualizadas correctamente'
    });
  } catch (error) {
    console.error('❌ Error actualizando preferencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando preferencias'
    });
  }
});

/**
 * @swagger
 * /api/notifications/history:
 *   get:
 *     summary: Obtener historial de notificaciones
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: unread_only
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Historial de notificaciones
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unread_only = false } = req.query;

    // TODO: Implementar consulta a base de datos
    const mockNotifications = [
      {
        id: 'notif_1',
        title: '🎯 Nueva Aplicación Recibida',
        message: 'Juan Pérez se ha postulado para "Desarrollador Frontend".',
        type: 'new_application',
        priority: 'high',
        read: false,
        timestamp: new Date().toISOString(),
        metadata: {
          applicationId: 123,
          studentName: 'Juan Pérez',
          offerName: 'Desarrollador Frontend'
        }
      },
      {
        id: 'notif_2',
        title: '✅ Candidato Aceptado',
        message: 'Has aceptado al candidato para "Backend Developer".',
        type: 'candidate_accepted',
        priority: 'low',
        read: true,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        metadata: {
          applicationId: 122,
          offerName: 'Backend Developer'
        }
      }
    ];

    const filteredNotifications = unread_only ? 
      mockNotifications.filter(n => !n.read) : 
      mockNotifications;

    const paginatedNotifications = filteredNotifications.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      unread_count: mockNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo historial de notificaciones'
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // TODO: Actualizar en base de datos
    console.log(`📖 Notificación ${id} marcada como leída por usuario ${userId}`);

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('❌ Error marcando notificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error marcando notificación como leída'
    });
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 */
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Actualizar todas las notificaciones del usuario en base de datos
    console.log(`📖 Todas las notificaciones marcadas como leídas para usuario ${userId}`);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('❌ Error marcando todas las notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error marcando todas las notificaciones como leídas'
    });
  }
});

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Obtener estadísticas del sistema de notificaciones (admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Solo permitir a administradores
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado'
      });
    }

    const stats = {
      websocket: wsController.getStats(),
      notification_service: notificationService.getServiceStats(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas'
    });
  }
});

// 🚀 Endpoint para webhooks/triggers automáticos
router.post('/trigger/application-status', authMiddleware, async (req, res) => {
  try {
    const { applicationId, studentId, companyId, newStatus, offerName, companyName } = req.body;

    await notificationService.notifyApplicationStatusChange(
      applicationId, studentId, companyId, newStatus, offerName, companyName
    );

    res.json({
      success: true,
      message: 'Notificaciones de cambio de estado enviadas'
    });
  } catch (error) {
    console.error('❌ Error en trigger de cambio de estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando notificaciones'
    });
  }
});

router.post('/trigger/new-application', authMiddleware, async (req, res) => {
  try {
    const { companyId, studentName, offerName, applicationId } = req.body;

    await notificationService.notifyNewApplication(companyId, studentName, offerName, applicationId);

    res.json({
      success: true,
      message: 'Notificación de nueva aplicación enviada'
    });
  } catch (error) {
    console.error('❌ Error en trigger de nueva aplicación:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando notificación'
    });
  }
});

export default router;