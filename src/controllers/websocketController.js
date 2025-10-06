// WebSocket controller para notificaciones en tiempo real
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { notificationService } from '../services/notificationService.js';

class WebSocketController {
  constructor() {
    this.wss = null;
  }

  /**
   * 🚀 Inicializar servidor WebSocket
   */
  initialize(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/notifications'
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    console.log('🔌 Servidor WebSocket inicializado en /ws/notifications');
  }

  /**
   * 🚀 Manejar nueva conexión WebSocket
   */
  async handleConnection(ws, request) {
    console.log('🔌 WebSocket: Nueva conexión entrante desde:', request.socket.remoteAddress);
    console.log('🔌 WebSocket: URL de conexión:', request.url);
    
    try {
      // Extraer token de la query string o headers
      let token;
      try {
        const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
        token = url.searchParams.get('token');
      } catch (error) {
        // Si falla el parsing de URL, intentar con el path directamente
        const urlParts = request.url.split('?');
        if (urlParts.length > 1) {
          const params = new URLSearchParams(urlParts[1]);
          token = params.get('token');
        }
      }
      
      // También verificar en headers como fallback
      if (!token) {
        token = request.headers.authorization?.replace('Bearer ', '');
      }

      if (!token) {
        console.log('❌ WebSocket: Token de autenticación requerido');
        ws.close(1008, 'Token de autenticación requerido');
        return;
      }

      // Verificar y decodificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id; // Corregir: usar 'id' en lugar de 'userId'
      const userRole = decoded.userType || decoded.role; // Usar userType o role como fallback

      // Registrar conexión en el servicio de notificaciones
      notificationService.registerConnection(userId, ws, userRole);

      // Configurar eventos del WebSocket
      ws.userId = userId;
      ws.userRole = userRole;
      ws.isAlive = true;

      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        notificationService.unregisterConnection(userId, ws);
        console.log(`🔌 WebSocket cerrado para usuario ${userId}`);
      });

      ws.on('error', (error) => {
        console.error(`❌ Error en WebSocket para usuario ${userId}:`, error);
        notificationService.unregisterConnection(userId, ws);
      });

      // Ping-pong para mantener conexión viva
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Enviar confirmación de conexión
      ws.send(JSON.stringify({
        type: 'connection_established',
        data: {
          userId,
          role: userRole,
          timestamp: new Date().toISOString()
        }
      }));

      console.log(`✅ WebSocket conectado: Usuario ${userId} (${userRole})`);

    } catch (error) {
      console.error('❌ Error en autenticación WebSocket:', error);
      ws.close(1008, 'Token inválido');
    }
  }

  /**
   * 🚀 Manejar mensajes del cliente
   */
  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'mark_notification_read':
          this.handleMarkNotificationRead(ws, data.notificationId);
          break;
          
        case 'get_notification_history':
          this.handleGetNotificationHistory(ws, data.limit, data.offset);
          break;
          
        case 'update_preferences':
          this.handleUpdatePreferences(ws, data.preferences);
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        default:
          console.log(`📨 Mensaje no reconocido de usuario ${ws.userId}:`, data.type);
      }
    } catch (error) {
      console.error(`❌ Error procesando mensaje de usuario ${ws.userId}:`, error);
    }
  }

  /**
   * 🚀 Marcar notificación como leída
   */
  async handleMarkNotificationRead(ws, notificationId) {
    try {
      // TODO: Actualizar en base de datos
      console.log(`📖 Notificación ${notificationId} marcada como leída por usuario ${ws.userId}`);
      
      ws.send(JSON.stringify({
        type: 'notification_marked_read',
        data: { notificationId, success: true }
      }));
    } catch (error) {
      console.error(`❌ Error marcando notificación como leída:`, error);
      ws.send(JSON.stringify({
        type: 'notification_marked_read',
        data: { notificationId, success: false, error: error.message }
      }));
    }
  }

  /**
   * 🚀 Obtener historial de notificaciones
   */
  async handleGetNotificationHistory(ws, limit = 20, offset = 0) {
    try {
      // TODO: Obtener de base de datos
      const mockNotifications = [
        {
          id: 'notif_1',
          title: 'Ejemplo de notificación',
          message: 'Esta es una notificación de ejemplo',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];

      ws.send(JSON.stringify({
        type: 'notification_history',
        data: {
          notifications: mockNotifications,
          total: mockNotifications.length,
          limit,
          offset
        }
      }));
    } catch (error) {
      console.error(`❌ Error obteniendo historial de notificaciones:`, error);
    }
  }

  /**
   * 🚀 Actualizar preferencias de notificación
   */
  handleUpdatePreferences(ws, preferences) {
    try {
      notificationService.setUserNotificationPreferences(ws.userId, preferences);
      
      ws.send(JSON.stringify({
        type: 'preferences_updated',
        data: { success: true }
      }));
      
      console.log(`⚙️ Preferencias actualizadas para usuario ${ws.userId}`);
    } catch (error) {
      console.error(`❌ Error actualizando preferencias:`, error);
      ws.send(JSON.stringify({
        type: 'preferences_updated',
        data: { success: false, error: error.message }
      }));
    }
  }

  /**
   * 🚀 Heartbeat para mantener conexiones vivas
   */
  startHeartbeat() {
    setInterval(() => {
      if (this.wss) {
        this.wss.clients.forEach((ws) => {
          if (!ws.isAlive) {
            console.log(`💔 Conexión muerta detectada para usuario ${ws.userId}`);
            return ws.terminate();
          }
          
          ws.isAlive = false;
          ws.ping();
        });
      }
    }, 30000); // Cada 30 segundos

    console.log('💓 Heartbeat WebSocket iniciado (30s)');
  }

  /**
   * 🚀 Obtener estadísticas del WebSocket
   */
  getStats() {
    if (!this.wss) return null;

    const connections = Array.from(this.wss.clients).map(ws => ({
      userId: ws.userId,
      role: ws.userRole,
      readyState: ws.readyState,
      isAlive: ws.isAlive
    }));

    return {
      totalConnections: this.wss.clients.size,
      activeConnections: connections.filter(c => c.readyState === 1).length,
      connections,
      notificationServiceStats: notificationService.getServiceStats()
    };
  }

  /**
   * 🚀 Cerrar servidor WebSocket
   */
  close() {
    if (this.wss) {
      this.wss.clients.forEach(ws => {
        ws.close(1001, 'Servidor cerrando');
      });
      this.wss.close();
      console.log('🔌 Servidor WebSocket cerrado');
    }
  }
}

export const wsController = new WebSocketController();
export default wsController;