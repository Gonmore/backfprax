# Ausbildung Backend API

Backend API para la plataforma Ausbildung - Sistema de gestión de prácticas profesionales.

## 🚀 Tecnologías

- **Node.js** con Express.js
- **PostgreSQL** con Sequelize ORM
- **JWT** para autenticación
- **Socket.io** para comunicación en tiempo real
- **Swagger** para documentación API
- **AdminJS** para panel de administración

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 13+
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repo-backend>
cd ausback
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

4. Configura la base de datos:
```bash
# Asegúrate de que PostgreSQL esté corriendo
# Ejecuta las migraciones
npx sequelize-cli db:migrate

# Opcional: ejecuta los seeders
npx sequelize-cli db:seed:all
```

## ⚙️ Variables de Entorno

Crea un archivo `.env` basado en `.env.production`:

```bash
# Entorno
NODE_ENV=production
PORT=5000

# Base de datos
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=ausbildung_prod
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_DIALECT=postgres

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro

# URLs
FRONTEND_URL=https://tu-frontend-domain.com
BACKEND_URL=https://tu-backend-domain.com

# CORS
CORS_ORIGINS=https://tu-frontend-domain.com
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Docker
```bash
# Construir imagen
docker build -f Dockerfile.prod -t ausbildung-backend .

# Ejecutar contenedor
docker run -p 5000:5000 ausbildung-backend
```

## 📚 API Documentation

La documentación Swagger está disponible en:
- Desarrollo: `http://localhost:5000/api-docs`
- Producción: `https://tu-backend-domain.com/api-docs`

## 🔧 Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm test` - Ejecuta los tests

## 🗄️ Base de Datos

### Migraciones
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo
```

### Seeders
```bash
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:undo
```

## 🔐 Autenticación

La API utiliza JWT para autenticación. Incluye el token en el header:
```
Authorization: Bearer <tu-jwt-token>
```

## 🌐 Endpoints Principales

- `POST /api/auth/login` - Login de usuario
- `GET /api/students/profile` - Perfil del estudiante
- `GET /api/companies/offers` - Ofertas de la empresa
- `POST /api/academic-verifications` - Solicitar verificación académica

## 📊 Panel de Administración

Accede al panel de administración en `/admin` con credenciales de administrador.

## 🤝 Contribución

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Ejecuta las pruebas
4. Crea un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo.