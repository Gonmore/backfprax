import pino from 'pino';

// Configuración simple que funciona en desarrollo y producción
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV === 'development' && {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'SYS:dd-mm-yyyy HH:mm:ss',
            },
        },
    }),
});

export default logger;