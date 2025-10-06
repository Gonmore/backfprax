import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret = process.env.JWT_SECRET || 'tu_secreto_jwt';
const expiresIn = process.env.JWT_EXPIRES_SECONDS || 3600; // 1 hora por defecto

export const generateToken = (user) => {
  return jwt.sign({
    id: user.id, // Mantener 'id' para consistencia con el payload actual
    username: user.username,
    userType: user.role // Cambiar 'role' a 'userType' para consistencia
  }, secret, {
    expiresIn: expiresIn // Usar la variable de entorno
  });
};

export const checkTokenValidity = (req) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies.jwt;
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return true;
  } catch (error) {
    return false;
  }
};

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.cookies.jwt;
  
    if (!token) {
      return res.redirect('/login');
    }
  
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.redirect('/login');
      }
  
      req.user = decoded;
      next();
    });
}

export const authenticateJWT = (req, res, next) => {
  console.log('🔐 ===== MIDDLEWARE authenticateJWT EJECUTÁNDOSE =====');
  console.log('🔐 URL:', req.url);
  console.log('🔐 Method:', req.method);
  const authHeader = req.headers.authorization;

  console.log('🟡 [DEBUG] Autenticación: Header recibido:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🔴 [ERROR] No se recibió el token o formato incorrecto');
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }

  const token = authHeader.substring(7);
  console.log('🟡 [DEBUG] Token extraído:', token);

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    console.log('🟢 [DEBUG] Token válido, usuario autenticado:', decoded);
    console.log('🟢 [DEBUG] Llamando a next()...');
    next();
  } catch (error) {
    console.log('🔴 [ERROR] Fallo al verificar el token:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// ← AGREGAR MIDDLEWARE PARA ONBOARDING
export function authenticate(req, res, next) {
    return authenticateJWT(req, res, next);
}