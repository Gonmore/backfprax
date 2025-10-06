import crypto from 'crypto';

/**
 * Servicio para generar enlaces de reuniones automáticos
 */
class MeetingService {
  /**
   * Genera un enlace único de Google Meet
   * @returns {string} Enlace de Google Meet
   */
  static generateGoogleMeetLink() {
    // Generar un código único de 10 caracteres alfanuméricos
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    return `https://meet.google.com/${code}`;
  }

  /**
   * Genera un enlace único de Zoom (como alternativa)
   * @returns {string} Enlace de Zoom
   */
  static generateZoomLink() {
    // Generar un ID de reunión único
    const meetingId = Math.floor(Math.random() * 1000000000);
    const password = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `https://zoom.us/j/${meetingId}?pwd=${password}`;
  }

  /**
   * Genera un enlace de reunión basado en el tipo solicitado
   * @param {string} type - Tipo de reunión ('google-meet', 'zoom', etc.)
   * @returns {string} Enlace de reunión
   */
  static generateMeetingLink(type = 'google-meet') {
    switch (type) {
      case 'google-meet':
        return this.generateGoogleMeetLink();
      case 'zoom':
        return this.generateZoomLink();
      default:
        return this.generateGoogleMeetLink();
    }
  }

  /**
   * Valida si un enlace es un enlace de Google Meet válido
   * @param {string} link - Enlace a validar
   * @returns {boolean} True si es válido
   */
  static isValidGoogleMeetLink(link) {
    const meetRegex = /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i;
    return meetRegex.test(link);
  }

  /**
   * Valida si un enlace es un enlace de Zoom válido
   * @param {string} link - Enlace a validar
   * @returns {boolean} True si es válido
   */
  static isValidZoomLink(link) {
    const zoomRegex = /^https:\/\/zoom\.us\/j\/\d+(\?pwd=[a-zA-Z0-9]+)?$/;
    return zoomRegex.test(link);
  }
}

export default MeetingService;