# Ausbildung Backend API

API para la aplicación de gestión de prácticas profesionales entre empresas, estudiantes y centros de estudio.

## Descripción General

Esta API permite gestionar las relaciones entre empresas, estudiantes y centros de estudio para facilitar el proceso de prácticas profesionales. Incluye endpoints para usuarios, empresas, estudiantes, centros de estudio, ofertas de prácticas, familias profesionales y tutores.

## Configuración del Proyecto

### Requisitos Previos
- Node.js >= 14.x
- Base de datos (PostgreSQL/MySQL/SQLite)
- NPM o Yarn

### Instalación
```bash
cd ausback
npm install
```

### Variables de Entorno
Crear un archivo `.env` con las siguientes variables:
```
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### Ejecución
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Documentación de la API

### Swagger Documentation
La documentación completa de la API está disponible en:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **JSON Schema**: `http://localhost:3000/api/docs.json`

## Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Estudiantes
- `GET /api/student` - Obtener todos los estudiantes
- `GET /api/student/:id` - Obtener estudiante por ID
- `POST /api/student` - Crear nuevo estudiante
- `PUT /api/student/:id` - Actualizar estudiante
- `DELETE /api/student/:id` - Eliminar estudiante

### Empresas
- `GET /api/company` - Obtener todas las empresas
- `GET /api/company/:id` - Obtener empresa por ID
- `POST /api/company` - Crear nueva empresa
- `PUT /api/company/:id` - Actualizar empresa
- `DELETE /api/company/:id` - Eliminar empresa

### Centros de Estudio
- `GET /api/scenter` - Obtener todos los centros (público)
- `PUT /api/scenter` - Obtener centros del usuario autenticado
- `POST /api/scenter` - Crear nuevo centro
- `GET /api/scenter/:id` - Obtener centro por ID
- `PUT /api/scenter/:id` - Actualizar centro
- `PATCH /api/scenter/:id` - Activar/desactivar centro
- `DELETE /api/scenter/:id` - Eliminar centro

### Ofertas de Prácticas
- `GET /api/offers` - Obtener todas las ofertas (público)
- `POST /api/offers` - Crear nueva oferta (autenticado)
- `GET /api/offers/:id` - Obtener oferta por ID (público)
- `PUT /api/offers/:id` - Actualizar oferta (autenticado)
- `DELETE /api/offers/:id` - Eliminar oferta (autenticado)
- `GET /api/offers/company/:companyId` - Obtener ofertas por empresa
- `GET /api/offers/profamily/:profamilyId` - Obtener ofertas por familia profesional

### Familias Profesionales
- `GET /api/profamilies` - Obtener todas las familias profesionales (público)
- `POST /api/profamilies` - Crear nueva familia profesional (autenticado)
- `GET /api/profamilies/:id` - Obtener familia profesional por ID (público)
- `PUT /api/profamilies/:id` - Actualizar familia profesional (autenticado)
- `DELETE /api/profamilies/:id` - Eliminar familia profesional (autenticado)
- `GET /api/profamilies/:id/students` - Obtener estudiantes por familia profesional
- `GET /api/profamilies/:id/tutors` - Obtener tutores por familia profesional

### Tutores
- `GET /api/tutors` - Obtener todos los tutores (público)
- `POST /api/tutors` - Crear nuevo tutor (autenticado)
- `GET /api/tutors/:id` - Obtener tutor por ID (público)
- `PUT /api/tutors/:id` - Actualizar tutor (autenticado)
- `DELETE /api/tutors/:id` - Eliminar tutor (autenticado)
- `GET /api/tutors/scenter/:scenterId` - Obtener tutores por centro de estudios
- `GET /api/tutors/profamily/:profamilyId` - Obtener tutores por familia profesional

### Aplicaciones
- `POST /api/applications` - Aplicar a una oferta (autenticado)
- `GET /api/applications/user/:userId` - Obtener aplicaciones del usuario (autenticado)
- `GET /api/applications/offer/:offerId` - Obtener aplicaciones de una oferta (autenticado)
- `PUT /api/applications/:applicationId/status` - Actualizar estado de aplicación (autenticado)
- `DELETE /api/applications/:applicationId` - Retirar aplicación (autenticado)

### Tokens de Empresa
- `GET /api/tokens/balance` - Obtener balance de tokens (autenticado)
- `POST /api/tokens/recharge` - Recargar tokens (autenticado)
- `POST /api/tokens/search-students` - Buscar estudiantes usando tokens (autenticado)
- `POST /api/tokens/access-cv/:studentId` - Acceder al CV usando tokens (autenticado)
- `GET /api/tokens/usage-history` - Obtener historial de uso de tokens (autenticado)

### Ofertas Actualizadas
- `GET /api/offers/my-offers/applications` - Obtener ofertas de la empresa con aplicaciones (autenticado)

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Para acceder a endpoints protegidos, incluir el token en el header:

```javascript
Authorization: Bearer <token>
```

## Modelos de Datos

### Usuario (User)
```javascript
{
  id: integer,
  username: string,
  email: string,
  password: string (hasheado),
  active: boolean,
  createdAt: datetime,
  updatedAt: datetime
}
```

### Estudiante (Student)
```javascript
{
  id: integer,
  name: string,
  surname: string,
  email: string,
  phone: string,
  address: string,
  userId: integer, // FK a User
  profamilyId: integer, // FK a Profamily
  createdAt: datetime,
  updatedAt: datetime
}
```

### Empresa (Company)
```javascript
{
  id: integer,
  name: string,
  code: string,
  city: string,
  address: string,
  phone: string,
  email: string,
  sector: string,
  createdAt: datetime,
  updatedAt: datetime
}
```

### Centro de Estudio (Scenter)
```javascript
{
  id: integer,
  name: string,
  code: string,
  city: string,
  address: string,
  phone: string,
  email: string,
  active: boolean,
  createdAt: datetime,
  updatedAt: datetime
}
```

### Oferta (Offer)
```javascript
{
  id: integer,
  name: string,
  location: string,
  mode: string, // presencial, remoto, híbrido
  type: string,
  period: string,
  schedule: string,
  min_hr: integer, // default: 200
  car: boolean, // default: false
  sector: string,
  tag: string,
  description: string,
  jobs: string,
  requisites: string,
  profamilyId: integer, // FK a Profamily
  createdAt: datetime,
  updatedAt: datetime
}
```

### Familia Profesional (Profamily)
```javascript
{
  id: integer,
  name: string,
  description: string,
  createdAt: datetime,
  updatedAt: datetime
}
```

### Tutor
```javascript
{
  id: string, // DNI, código, etc.
  name: string,
  email: string,
  grade: string,
  degree: string,
  tutorId: integer, // FK a Scenter
  profamilyId: integer, // FK a Profamily
  createdAt: datetime,
  updatedAt: datetime
}
```

### CV
```javascript
{
  id: integer,
  studentId: integer, // FK a Student
  // otros campos del CV
  createdAt: datetime,
  updatedAt: datetime
}
```

## Relaciones entre Modelos

### Relaciones Uno a Muchos
- **Scenter** → **Tutor** (Un centro tiene muchos tutores)
- **Profamily** → **Offer** (Una familia profesional tiene muchas ofertas)

### Relaciones Muchos a Muchos
- **User** ↔ **Scenter** (Usuarios pueden estar asociados a múltiples centros)
- **User** ↔ **Company** (Usuarios pueden estar asociados a múltiples empresas)
- **Student** ↔ **Offer** (Estudiantes pueden aplicar a múltiples ofertas)
- **Company** ↔ **Offer** (Empresas pueden tener múltiples ofertas)
- **Company** ↔ **CV** (Empresas pueden ver múltiples CVs)

### Relaciones Uno a Uno
- **User** → **Student** (Un usuario tiene un estudiante)
- **Student** → **CV** (Un estudiante tiene un CV)
- **Profamily** → **Student** (Un estudiante pertenece a una familia profesional)
- **Profamily** → **Tutor** (Un tutor pertenece a una familia profesional)

## Códigos de Respuesta HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Solicitud incorrecta
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No autorizado
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## Ejemplos de Uso

### Crear una Oferta
```javascript
// POST /api/offers
{
  "name": "Prácticas en Desarrollo Web",
  "location": "Madrid",
  "mode": "presencial",
  "type": "prácticas",
  "period": "3 meses",
  "schedule": "9:00-17:00",
  "min_hr": 300,
  "car": false,
  "sector": "Tecnología",
  "tag": "desarrollo, web, javascript",
  "description": "Prácticas profesionales en desarrollo web frontend y backend",
  "jobs": "Desarrollo de aplicaciones web, mantenimiento de código, testing",
  "requisites": "Conocimientos básicos de HTML, CSS, JavaScript",
  "profamilyId": 1,
  "companyId": 1
}
```

### Obtener Ofertas por Empresa
```javascript
// GET /api/offers/company/1
// Respuesta:
[
  {
    "id": 1,
    "name": "Prácticas en Desarrollo Web",
    "location": "Madrid",
    "mode": "presencial",
    "Companies": [
      {
        "id": 1,
        "name": "TechCorp",
        "city": "Madrid",
        "sector": "Tecnología"
      }
    ],
    "Profamily": {
      "id": 1,
      "name": "Informática y Comunicaciones",
      "description": "Familia profesional de informática"
    }
  }
]
```

### Crear un Tutor
```javascript
// POST /api/tutors
{
  "id": "12345678A",
  "name": "Juan Pérez",
  "email": "juan.perez@centro.edu",
  "grade": "Doctor",
  "degree": "Ingeniería Informática",
  "scenterId": 1,
  "profamilyId": 1
}
```

## Herramientas Recomendadas para Testing

### Postman
Colección de endpoints disponible para importar en Postman. Incluye ejemplos de todas las llamadas a la API.

### cURL
```bash
# Obtener todas las ofertas
curl -X GET http://localhost:3000/api/offers

# Crear una oferta (requiere autenticación)
curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Prácticas en Marketing",
    "location": "Barcelona",
    "mode": "híbrido",
    "type": "prácticas",
    "period": "6 meses",
    "schedule": "flexible",
    "sector": "Marketing",
    "tag": "marketing, digital, redes sociales",
    "description": "Prácticas en marketing digital",
    "jobs": "Gestión de redes sociales, análisis de métricas",
    "requisites": "Conocimientos básicos de marketing",
    "profamilyId": 2
  }'
```

## Manejo de Errores

La API devuelve errores en formato JSON:
```javascript
{
  "mensaje": "Descripción del error",
  "message": "Error message" // Campo alternativo
}
```

## Logging

La aplicación utiliza Winston para logging. Los logs se guardan en:
- `src/logs/access.log` - Logs de acceso
- Consola - Logs de desarrollo

## Seguridad

- Autenticación JWT
- Bcrypt para hasheo de contraseñas
- Middleware de autenticación para endpoints protegidos
- Validación de entrada de datos

## Consideraciones para el Frontend

1. **Autenticación**: Guardar el token JWT en localStorage o sessionStorage
2. **Interceptores**: Configurar interceptores para agregar automáticamente el token
3. **Manejo de errores**: Implementar manejo global de errores HTTP
4. **Carga de datos**: Usar los endpoints de relaciones para cargar datos relacionados
5. **Paginación**: Implementar paginación para listas largas (a implementar en futuras versiones)

## Próximas Mejoras

- [ ] Paginación en endpoints de listado
- [ ] Filtrado y búsqueda avanzada
- [ ] Notificaciones en tiempo real
- [ ] Subida de archivos para CVs
- [ ] Validación de datos más estricta
- [ ] Rate limiting
- [ ] Logs de auditoría

## Contacto

Para dudas o problemas con la API, contactar al equipo de desarrollo del backend.
