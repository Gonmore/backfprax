// Sistema de notificaciones en tiempo real
import { EventEmitter } from 'events';

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.activeConnections = new Map(); // userId -> websocket connections
    this.notificationQueue = new Map(); // userId -> notifications[]
    this.settings = new Map(); // userId -> notification preferences
  }

  /**
   * 🚀 Registrar conexión WebSocket de usuario
   */
  registerConnection(userId, websocket, userRole) {
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, []);
    }
    
    const connections = this.activeConnections.get(userId);
    connections.push({ websocket, role: userRole, connectedAt: new Date() });
    
    // Enviar notificaciones pendientes
    this.sendQueuedNotifications(userId);
    
    console.log(`📱 Usuario ${userId} (${userRole}) conectado. Conexiones activas: ${connections.length}`);
  }

  /**
   * 🚀 Desregistrar conexión WebSocket
   */
  unregisterConnection(userId, websocket) {
    const connections = this.activeConnections.get(userId);
    if (connections) {
      const index = connections.findIndex(conn => conn.websocket === websocket);
      if (index > -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.activeConnections.delete(userId);
        }
        console.log(`📱 Usuario ${userId} desconectado`);
      }
    }
  }

  /**
   * 🚀 Enviar notificación a usuario específico
   */
  async sendNotificationToUser(userId, notification) {
    const fullNotification = {
      id: this.generateNotificationId(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    // Verificar preferencias de notificación
    if (!this.shouldSendNotification(userId, notification.type)) {
      console.log(`🔕 Notificación bloqueada por preferencias: ${notification.type} para usuario ${userId}`);
      return;
    }

    const connections = this.activeConnections.get(userId);
    
    if (connections && connections.length > 0) {
      // Usuario conectado - enviar inmediatamente
      connections.forEach(({ websocket }) => {
        if (websocket.readyState === websocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'notification',
            data: fullNotification
          }));
        }
      });
      
      console.log(`✅ Notificación enviada a usuario ${userId}: ${notification.title}`);
    } else {
      // Usuario desconectado - agregar a cola
      this.queueNotification(userId, fullNotification);
      console.log(`📬 Notificación encolada para usuario ${userId}: ${notification.title}`);
    }

    // Guardar en base de datos
    await this.saveNotificationToDB(userId, fullNotification);
  }

  /**
   * 🚀 Enviar notificación a múltiples usuarios
   */
  async sendBulkNotification(userIds, notification) {
    const promises = userIds.map(userId => 
      this.sendNotificationToUser(userId, notification)
    );
    
    await Promise.all(promises);
    console.log(`📢 Notificación masiva enviada a ${userIds.length} usuarios`);
  }

  /**
   * 🚀 Notificaciones específicas para aplicaciones de estudiantes
   */
  async notifyApplicationStatusChange(applicationId, studentId, companyId, newStatus, offerName, companyName) {
    const statusMessages = {
      'pending': {
        student: {
          title: '📋 Aplicación Enviada',
          message: `Tu aplicación para "${offerName}" en ${companyName} ha sido enviada exitosamente.`,
          type: 'application_sent',
          priority: 'medium'
        }
      },
      'reviewing': {
        student: {
          title: '👀 Aplicación en Revisión',
          message: `${companyName} está revisando tu aplicación para "${offerName}".`,
          type: 'application_reviewing',
          priority: 'medium'
        }
      },
      'interview_requested': {
        student: {
          title: '🎉 ¡Entrevista Solicitada!',
          message: `${companyName} quiere entrevistarte para "${offerName}". ¡Revisa los detalles!`,
          type: 'interview_request',
          priority: 'high',
          action: {
            type: 'view_application',
            url: `/estudiante/aplicaciones/${applicationId}`
          }
        },
        company: {
          title: '📅 Entrevista Programada',
          message: `Entrevista programada con estudiante para "${offerName}".`,
          type: 'interview_scheduled',
          priority: 'medium'
        }
      },
      'accepted': {
        student: {
          title: '🎊 ¡Felicidades! Fuiste Aceptado',
          message: `¡Excelentes noticias! ${companyName} te ha aceptado para "${offerName}".`,
          type: 'application_accepted',
          priority: 'high',
          action: {
            type: 'view_offer_details',
            url: `/estudiante/ofertas/${applicationId}`
          }
        },
        company: {
          title: '✅ Candidato Aceptado',
          message: `Has aceptado al candidato para "${offerName}".`,
          type: 'candidate_accepted',
          priority: 'low'
        }
      },
      'rejected': {
        student: {
          title: '📄 Actualización de Aplicación',
          message: `Gracias por tu interés en "${offerName}". En esta ocasión hemos decidido continuar con otros candidatos.`,
          type: 'application_rejected',
          priority: 'medium'
        }
      }
    };

    const notifications = statusMessages[newStatus];
    
    if (notifications?.student) {
      await this.sendNotificationToUser(studentId, {
        ...notifications.student,
        metadata: {
          applicationId,
          offerName,
          companyName,
          status: newStatus
        }
      });
    }

    if (notifications?.company) {
      await this.sendNotificationToUser(companyId, {
        ...notifications.company,
        metadata: {
          applicationId,
          offerName,
          studentId,
          status: newStatus
        }
      });
    }
  }

  /**
   * 🚀 Notificaciones para nuevas aplicaciones
   */
  async notifyNewApplication(companyId, studentName, offerName, applicationId) {
    await this.sendNotificationToUser(companyId, {
      title: '🎯 Nueva Aplicación Recibida',
      message: `${studentName} se ha postulado para "${offerName}".`,
      type: 'new_application',
      priority: 'high',
      action: {
        type: 'view_candidates',
        url: `/empresa/ofertas?highlight=${applicationId}`
      },
      metadata: {
        applicationId,
        studentName,
        offerName
      }
    });
  }

  /**
   * 🚀 Notificaciones para mensajes de empresas
   */
  async notifyStudentContactedByCompany(studentId, companyName, offerName, message) {
    await this.sendNotificationToUser(studentId, {
      title: '💌 Mensaje de Empresa',
      message: `${companyName} te ha contactado sobre "${offerName}".`,
      type: 'company_contact',
      priority: 'high',
      action: {
        type: 'check_email',
        message: 'Revisa tu email para ver el mensaje completo'
      },
      metadata: {
        companyName,
        offerName,
        messagePreview: message.substring(0, 100) + '...'
      }
    });
  }

  /**
   * 🚀 Notificaciones para ofertas que expiran pronto
   */
  async notifyOfferExpiringSoon(companyId, offerName, daysRemaining) {
    await this.sendNotificationToUser(companyId, {
      title: '⏰ Oferta Expirando Pronto',
      message: `Tu oferta "${offerName}" expira en ${daysRemaining} días.`,
      type: 'offer_expiring',
      priority: 'medium',
      action: {
        type: 'extend_offer',
        url: `/empresa/ofertas/edit`
      },
      metadata: {
        offerName,
        daysRemaining
      }
    });
  }

  /**
   * 🚀 Notificaciones para nuevas ofertas relevantes (estudiantes)
   */
  async notifyRelevantOfferAvailable(studentId, offerName, companyName, affinityLevel, offerId) {
    if (affinityLevel === 'muy alto' || affinityLevel === 'alto') {
      await this.sendNotificationToUser(studentId, {
        title: '🎯 Nueva Oferta Perfecta para Ti',
        message: `"${offerName}" en ${companyName} tiene ${affinityLevel} afinidad contigo.`,
        type: 'relevant_offer',
        priority: affinityLevel === 'muy alto' ? 'high' : 'medium',
        action: {
          type: 'view_offer',
          url: `/estudiante/ofertas/${offerId}`
        },
        metadata: {
          offerName,
          companyName,
          affinityLevel,
          offerId
        }
      });
    }
  }

  // Métodos auxiliares privados
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  queueNotification(userId, notification) {
    if (!this.notificationQueue.has(userId)) {
      this.notificationQueue.set(userId, []);
    }
    
    const queue = this.notificationQueue.get(userId);
    queue.push(notification);
    
    // Mantener solo las últimas 50 notificaciones
    if (queue.length > 50) {
      queue.splice(0, queue.length - 50);
    }
  }

  sendQueuedNotifications(userId) {
    const queue = this.notificationQueue.get(userId);
    if (queue && queue.length > 0) {
      const connections = this.activeConnections.get(userId);
      
      connections.forEach(({ websocket }) => {
        if (websocket.readyState === websocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'queued_notifications',
            data: queue
          }));
        }
      });
      
      // Limpiar cola después de enviar
      this.notificationQueue.delete(userId);
      console.log(`📬 ${queue.length} notificaciones pendientes enviadas a usuario ${userId}`);
    }
  }

  shouldSendNotification(userId, notificationType) {
    const userSettings = this.settings.get(userId);
    if (!userSettings) return true; // Permitir por defecto
    
    return userSettings[notificationType] !== false;
  }

  async saveNotificationToDB(userId, notification) {
    // TODO: Implementar guardado en base de datos
    // Esta función se conectaría con el modelo de notificaciones
    console.log(`💾 Guardando notificación en BD para usuario ${userId}`);
  }

  /**
   * 🚀 Configurar preferencias de notificación de usuario
   */
  setUserNotificationPreferences(userId, preferences) {
    this.settings.set(userId, preferences);
    console.log(`⚙️ Preferencias de notificación actualizadas para usuario ${userId}`);
  }

  /**
   * 🚀 Obtener estadísticas del servicio
   */
  getServiceStats() {
    return {
      activeConnections: Array.from(this.activeConnections.entries()).map(([userId, connections]) => ({
        userId,
        connectionCount: connections.length,
        roles: connections.map(c => c.role)
      })),
      queuedNotifications: Array.from(this.notificationQueue.entries()).map(([userId, notifications]) => ({
        userId,
        count: notifications.length
      })),
      totalActiveUsers: this.activeConnections.size,
      totalConnections: Array.from(this.activeConnections.values()).reduce((sum, conns) => sum + conns.length, 0)
    };
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default NotificationService;