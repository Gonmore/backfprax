// app.js 
import 'dotenv/config'
import sequelize from './src/database/database.js'
import './src/models/relations.js'
import logger from './src/logs/logger.js'
import https from 'https';
import fs from 'fs-extra';
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import SequelizeStore from 'connect-session-sequelize'
import passport from './passport-config.js'
import { morgan_dev_log, morgan_file_access } from './src/logs/morganConfig.js'
import adminRouter from './src/routes/adminRoutes.js'
import authRouter from './src/routes/authRoutes.js'
import userRouter from './src/routes/userRoutes.js'
import studentRouter from './src/routes/studentRoutes.js'
import scenterRouter from './src/routes/scenterRoutes.js'
import companyRouter from './src/routes/companyRoutes.js'
import userCompanyRouter from './src/routes/userCompanyRoutes.js'
import userScenterRouter from './src/routes/userScenterRoutes.js'
import debugRouter from './src/routes/debugRoutes.js'
import offerRouter from './src/routes/offerRoutes.js'
import profamilyRouter from './src/routes/profamilyRoutes.js'
import tutorRouter from './src/routes/tutorRoutes.js'
import seedRouter from './src/routes/seedRoutes.js'
import applicationRouter from './src/routes/applicationRoutes.js'
import tokenRouter from './src/routes/tokenRoutes.js'
import adminTempRouter from './src/routes/adminRoutes.temp.js'
import swaggerDocs from './src/swagger.js'
import cors from 'cors';
import onboardingRoutes from './src/routes/onboardingRoutes.js';
import geographyRoutes from './src/routes/geographyRoutes.js';
import skillRoutes from './src/routes/skillRoutes.js';
import studentSkillRoutes from './src/routes/studentSkillRoutes.js';
import notificationRoutes from './src/routes/notifications.js';
import validationRoutes from './src/routes/validationRoutes.js';
import cvRoutes from './src/routes/cvRoutes.js';
import scenterUserRoutes from './src/routes/scenterUserRoutes.js';
import academicVerificationRoutes from './src/routes/academicVerificationRoutes.js';
import http from 'http';
import websocketController from './src/controllers/websocketController.js';
import os from 'os';

// Función para obtener la IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}


const app = express();

// Configurar CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);

    // Permitir localhost para desarrollo
    if (origin.startsWith('http://localhost:')) return callback(null, true);

    // Permitir conexiones desde la red local (192.168.x.x o 10.x.x.x)
    const isLocalNetwork = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin);
    if (isLocalNetwork) return callback(null, true);

    // En producción, podrías querer ser más restrictivo
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }

    // En desarrollo, permitir todo
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const port = process.env.PORT || 5001;
console.log(`🔧 Puerto configurado: ${port}`);

const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};

// Iniciando relaciones de DB
// 🔥 TEMPORALMENTE DESACTIVADO: Remover {force: true} para no dropear tablas en cada inicio
// sequelize.sync().then(async () => {
//   console.log("Base de datos sincronizada (sin forzar)")
// });

const SequelizeStoreSession = SequelizeStore(session.Store)

// Configurar middleware de sesión
app.use(session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStoreSession({
      db: sequelize,
      tableName: 'Session',
    })
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser())
app.use(morgan_dev_log)
app.use(morgan_file_access)

// Admin routes
app.use(adminRouter);

// Auth routes - API para login/register local
app.use('/api/auth', authRouter);

// Auth social routes - Para Google/Facebook (sin /api)
app.use('/auth', authRouter);

// API routes
app.use('/api/users', userRouter);
app.use('/api/student', studentRouter);
app.use('/api/student-skills', studentSkillRoutes);
app.use('/api/students', studentSkillRoutes); // 🔥 studentSkillRoutes PRIMERO
app.use('/api/scenter', scenterRouter);
app.use('/api/company', companyRouter);
app.use('/api/user-company', userCompanyRouter);
app.use('/api/user-scenter', userScenterRouter);
app.use('/api/offers', offerRouter);
app.use('/api/profamilies', profamilyRouter);
app.use('/api/tutors', tutorRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/tokens', tokenRouter);
app.use('/api/admin-temp', adminTempRouter);
app.use('/api/dev', seedRouter);
app.use('/api/debug', debugRouter);
app.use('/api/geography', geographyRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/students', studentRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/scenter-user', scenterUserRoutes);
app.use('/api/academic-verifications', academicVerificationRoutes);
app.use('/api', validationRoutes);

// Onboarding routes
app.use('/onboarding', onboardingRoutes);

// Static routes
app.get('/', (req, res) => {
    // Importar la función de verificación de token
    const { checkTokenValidity } = require('./src/middlewares/authenticate.midlleware.js');

    // Verificar si el usuario tiene un token válido
    if (checkTokenValidity(req)) {
        // Usuario autenticado - redirigir al dashboard
        return res.redirect('/dashboard');
    } else {
        // Usuario no autenticado - redirigir al login
        return res.redirect('/login');
    }
});

// 🏥 HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    const healthCheck = {
        timestamp: new Date().toISOString(),
        status: 'OK',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
            database: 'OK', // TODO: Verificar conexión a BD
            cache: 'OK',     // TODO: Verificar Redis si se usa
            websocket: 'OK'  // TODO: Verificar WebSocket
        }
    };
    
    res.status(200).json(healthCheck);
});

app.get('/privacy', (req, res) => { 
    res.send('Pagina de privacidad');
});

app.get('/terms', (req, res) => { 
    res.send('Terminos y condiciones');
});

app.get('/clear_user', (req, res) => { 
    res.send('Como eliminar tus datos de usuario');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 ===== GLOBAL ERROR HANDLER ACTIVADO =====');
    console.error('🚨 URL:', req.url);
    console.error('🚨 Method:', req.method);
    console.error('🚨 Headers:', req.headers);
    console.error('🚨 GLOBAL ERROR HANDLER:', error);
    console.error('🚨 Stack trace:', error.stack);
    
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// Servidor escuchando en el puerto
const server = http.createServer(app);

// Inicializar WebSocket controller
websocketController.initialize(server);

// Iniciar heartbeat para mantener conexiones WebSocket vivas
websocketController.startHeartbeat();

server.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`🚀 Aplicación escuchando en:`);
  console.log(`   📍 Local: http://localhost:${port}`);
  console.log(`   🌐 Red:   http://0.0.0.0:${port}`);
  console.log(`   🏠 IP:    http://${localIP}:${port}`);
  console.log(`🔌 WebSocket server inicializado`);
  logger.info(`Server started on port: ${port} with WebSocket support - Accessible from network at ${localIP}:${port}`);
  swaggerDocs(app, port)
});