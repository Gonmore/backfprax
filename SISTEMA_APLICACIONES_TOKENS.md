# Sistema de Aplicaciones y Tokens - Implementación Completa

## 🎯 Resumen de la Implementación

Se ha implementado un sistema completo de aplicaciones entre estudiantes y empresas, junto con un sistema de monetización basado en tokens.

## 📋 Funcionalidades Implementadas

### 1. Sistema de Aplicaciones
- **Estudiantes pueden aplicar a ofertas**
- **Empresas pueden ver y gestionar aplicaciones**
- **Estados de aplicación**: pending, reviewed, accepted, rejected, withdrawn
- **Mensajes y notas**: Comunicación entre estudiantes y empresas

### 2. Sistema de Tokens (Monetización)
- **Balance de tokens por empresa**
- **Costos por acción**:
  - Búsqueda de estudiantes: 1 token por estudiante
  - Acceso a CV: 3 tokens por estudiante
  - Contacto con estudiante: 2 tokens por estudiante
- **Historial de uso completo**
- **Tokens gratis iniciales** (10 tokens por empresa)

### 3. Búsqueda Avanzada de Estudiantes
- **Filtrado por múltiples criterios**:
  - Familia profesional
  - Grado académico
  - Curso
  - Disponibilidad de vehículo
  - Etiquetas/habilidades
- **Prevención de duplicados**: No se cobra múltiples veces por el mismo estudiante

## 🔧 Archivos Creados/Modificados

### Nuevos Modelos
- `src/models/application.js` - Modelo de aplicaciones
- `src/models/companyToken.js` - Modelos de tokens y historial de uso

### Nuevos Controladores
- `src/controllers/applicationController.js` - Gestión de aplicaciones
- `src/controllers/companyTokenController.js` - Gestión de tokens

### Nuevas Rutas
- `src/routes/applicationRoutes.js` - Rutas de aplicaciones
- `src/routes/tokenRoutes.js` - Rutas de tokens

### Archivos Modificados
- `src/models/relations.js` - Relaciones actualizadas
- `src/controllers/offerController.js` - Estadísticas de aplicaciones
- `src/routes/offerRoutes.js` - Nueva ruta para ofertas con aplicaciones
- `app.js` - Rutas registradas
- `API_DOCUMENTATION.md` - Documentación actualizada
- `API_EXAMPLES.md` - Ejemplos de uso
- `src/database/seed.js` - Imports actualizados

## 🚀 Endpoints Disponibles

### Aplicaciones (`/api/applications`)
```
POST   /                     - Aplicar a una oferta
GET    /user/:userId         - Obtener aplicaciones del usuario
GET    /offer/:offerId       - Obtener aplicaciones de una oferta
PUT    /:applicationId/status - Actualizar estado de aplicación
DELETE /:applicationId       - Retirar aplicación
```

### Tokens (`/api/tokens`)
```
GET    /balance              - Obtener balance de tokens
POST   /recharge             - Recargar tokens
POST   /search-students      - Buscar estudiantes (consume tokens)
POST   /access-cv/:studentId - Acceder al CV (consume tokens)
GET    /usage-history        - Historial de uso
```

### Ofertas Actualizadas (`/api/offers`)
```
GET    /my-offers/applications - Ofertas de la empresa con estadísticas
```

## 💡 Flujo de Trabajo

### Para Estudiantes:
1. **Ver ofertas disponibles** → `GET /api/offers`
2. **Aplicar a una oferta** → `POST /api/applications`
3. **Ver mis aplicaciones** → `GET /api/applications/user/:userId`
4. **Retirar aplicación** → `DELETE /api/applications/:applicationId`

### Para Empresas:
1. **Ver aplicaciones a mis ofertas** → `GET /api/applications/offer/:offerId`
2. **Aceptar/rechazar aplicaciones** → `PUT /api/applications/:applicationId/status`
3. **Ver balance de tokens** → `GET /api/tokens/balance`
4. **Buscar estudiantes** → `POST /api/tokens/search-students`
5. **Acceder a CVs** → `POST /api/tokens/access-cv/:studentId`

## 🔒 Seguridad y Permisos

- **Autenticación JWT** requerida para todas las operaciones
- **Verificación de permisos** para acceder a aplicaciones
- **Validación de propiedad** de ofertas y aplicaciones
- **Prevención de aplicaciones duplicadas**

## 💰 Modelo de Monetización

### Acciones Gratuitas:
- Ver aplicaciones a ofertas propias
- Gestionar aplicaciones recibidas
- Crear y publicar ofertas

### Acciones con Costo (Tokens):
- Buscar estudiantes que no aplicaron
- Acceder a CVs de estudiantes
- Contactar estudiantes directamente

### Precios Sugeridos:
- 1 token = €0.50
- Paquete de 50 tokens = €20 (20% descuento)
- Paquete de 100 tokens = €35 (30% descuento)

## 📊 Estadísticas Implementadas

### Para Ofertas:
- Total de aplicaciones
- Aplicaciones por estado
- Tasa de conversión

### Para Empresas:
- Balance de tokens actual
- Tokens utilizados
- Historial de búsquedas
- Estudiantes contactados

## 🎯 Próximos Pasos Recomendados

1. **Implementar notificaciones**:
   - Email cuando se recibe una aplicación
   - SMS/Push cuando cambia el estado

2. **Dashboard analítico**:
   - Métricas de rendimiento
   - Gráficos de aplicaciones
   - ROI de tokens

3. **Sistema de chat**:
   - Comunicación directa empresa-estudiante
   - Historial de conversaciones

4. **Integración de pagos**:
   - Stripe/PayPal para recarga de tokens
   - Facturación automática

5. **API de matching**:
   - Algoritmo de recomendación
   - Puntuación de compatibilidad

## ✅ Estado del Sistema

- ✅ **Backend funcionando** en puerto 5000
- ✅ **Base de datos sincronizada** con nuevos modelos
- ✅ **Endpoints disponibles** y documentados
- ✅ **Validaciones implementadas**
- ✅ **Logging configurado**
- ✅ **Documentación actualizada**

## 🔧 Comandos Útiles

```bash
# Iniciar servidor
npm run dev

# Seed base de datos
GET /api/dev/seed

# Probar endpoints
curl -X GET http://localhost:5000/api/offers
curl -X POST http://localhost:5000/api/applications
```

El sistema está listo para ser usado en producción con las funcionalidades básicas implementadas. Se recomienda implementar las mejoras adicionales según las necesidades específicas del negocio.
