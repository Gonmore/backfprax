import morgan from 'morgan'

// Configuración simple de Morgan para desarrollo y producción
const loggerFormat = '[:date[iso]] :method :url :status :res[content-length] - :response-time ms';

// Logger para desarrollo (consola)
const morgan_dev_log = morgan('dev')

// Logger para archivos (solo en desarrollo local, en producción usar servicios de logging)
const morgan_file_access = process.env.NODE_ENV === 'development'
  ? morgan(loggerFormat, {
      skip: (req, res) => res.statusCode >= 400 // Solo loggear requests exitosas en desarrollo
    })
  : (req, res, next) => next() // No-op en producción

export { morgan_dev_log, morgan_file_access }

