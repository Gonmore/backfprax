# 🚀 Ausbildung - Seed de Producción

## 📋 Resumen de Cambios

### ✅ Problema de Registro de Centros de Estudios - SOLUCIONADO
- **Antes**: Solo permitía seleccionar centros existentes
- **Ahora**: Permite crear nuevo centro educativo o seleccionar existente
- **Cómo funciona**:
  ```json
  // Para seleccionar centro existente
  {
    "role": "scenter",
    "scenterId": 1
  }

  // Para crear nuevo centro
  {
    "role": "scenter",
    "scenterData": {
      "name": "Nuevo Centro FP",
      "code": "NCFP001",
      "city": "Madrid",
      "address": "Calle Ejemplo 123",
      "phone": "911234567",
      "email": "info@nuevo.edu.es",
      "codigo_postal": "28001"
    }
  }
  ```

### 🌱 Seed de Producción Completo

#### 📊 Datos Creados Automáticamente en Railway:
- **35 Skills** profesionales por categorías (Desarrollo Web, Móvil, Diseño, Marketing, etc.)
- **10 Familias Profesionales** completas
- **4 Centros de Estudios** (Madrid, Barcelona, Valencia, Sevilla)
- **4 Empresas** (Tecnología, Consultoría, Sanidad, Marketing)
- **18 Usuarios** totales:
  - **6 Estudiantes** (con perfiles completos y skills)
  - **4 Empresas** (con relaciones empresa-usuario)
  - **4 Centros** (con relaciones centro-usuario)
  - **3 Tutores**
  - **1 Admin**
- **8 Ofertas de Prácticas** (2 por empresa)
- **Skills asignados** a estudiantes y ofertas
- **3 Verificaciones Académicas** (estudiantes verificados por centros)

#### 🎓 Estudiantes con Formación Académica:
- **Verificados** (3 estudiantes): Juan Pérez, María González, Ana López
- **No verificados** (3 estudiantes): Carlos Ruiz, David Martín, Laura Sánchez

## 🚀 Ejecución del Seed

### Opción 1: Automático en Railway (Recomendado)
El seed se ejecuta automáticamente cuando Railway hace deploy por primera vez.

### Opción 2: Manual en Producción
```bash
# Endpoint para ejecutar seed (sin borrar datos existentes)
POST https://backfprax-production.up.railway.app/api/dev/seed

# Endpoint para FORZAR seed completo (borra y recrea TODO)
POST https://backfprax-production.up.railway.app/api/dev/seed-force
```

### Opción 3: Local para Desarrollo
```bash
# Ejecutar seed localmente
node run-seed.js
```

## 👥 Usuarios de Prueba Creados

### 🔐 Administrador
- **Email**: admin@ausbildung.com
- **Password**: admin123

### 🏢 Empresas (4)
| Usuario | Email | Empresa | Ciudad |
|---------|-------|---------|--------|
| empresa1 | rrhh@techsolutions.es | TechSolutions España | Madrid |
| empresa2 | practicas@consultoriabcn.es | Consultoría Empresarial BCN | Barcelona |
| empresa3 | recursos@healthcare.es | HealthCare Valencia | Valencia |
| empresa4 | talento@marketingpro.es | Marketing Digital Pro | Sevilla |

**Password para todas**: 123456

### 🏫 Centros de Estudios (4)
| Usuario | Email | Centro | Ciudad |
|---------|-------|--------|--------|
| centro1 | coordinador@iestecnologico.edu.es | IES Tecnológico Madrid | Madrid |
| centro2 | director@fpavanzada.edu.es | Centro de FP Avanzada Barcelona | Barcelona |
| centro3 | jefe@isuvalencia.edu.es | Instituto Superior Valencia | Valencia |
| centro4 | coordinadora@cpsevilla.edu.es | Centro Profesional Sevilla | Sevilla |

**Password para todas**: 123456

### 🎓 Estudiantes (6)
| Usuario | Email | Formación | Verificado |
|---------|-------|-----------|------------|
| estudiante1 | juan.perez@test.com | Desarrollo Web | ✅ Sí |
| estudiante2 | maria.gonzalez@test.com | Marketing Digital | ✅ Sí |
| estudiante3 | carlos.ruiz@test.com | Administración | ❌ No |
| estudiante4 | ana.lopez@test.com | Auxiliar Enfermería | ✅ Sí |
| estudiante5 | david.martin@test.com | Educación Infantil | ❌ No |
| estudiante6 | laura.sanchez@test.com | Diseño Gráfico | ❌ No |

**Password para todas**: 123456

### 👨‍🏫 Tutores (3)
| Usuario | Email | Especialidad |
|---------|-------|--------------|
| tutor1 | carmen.fernandez@ies001.edu | Desarrollo Web |
| tutor2 | roberto.silva@fp002.edu | Administración |
| tutor3 | laura.morales@is003.edu | Sanidad |

**Password para todas**: 123456

## 💼 Ofertas de Prácticas Disponibles

### TechSolutions España (Madrid)
1. **Desarrollador Web Full Stack** - 800€/mes - React, Node.js, PostgreSQL
2. **Desarrollador Frontend React** - 750€/mes - React, JavaScript, CSS

### Consultoría Empresarial BCN (Barcelona)
3. **Consultor Junior de Gestión** - 900€/mes - Excel, PowerPoint
4. **Analista de RRHH** - 850€/mes - RRHH, Excel

### HealthCare Valencia (Valencia)
5. **Auxiliar de Enfermería** - 950€/mes - Primeros auxilios
6. **Recepcionista Administrativo** - 700€/mes - Administración

### Marketing Digital Pro (Sevilla)
7. **Community Manager** - 750€/mes - Redes sociales, Diseño
8. **Especialista en Google Ads** - 800€/mes - Google Ads, Analytics

## 🔧 Próximos Pasos

1. **Railway redeployará automáticamente** con el nuevo seed
2. **Verificar logs** para confirmar que el seed se ejecutó
3. **Probar login** con cualquiera de los usuarios de prueba
4. **Verificar ofertas** disponibles en el sistema

## 📞 Soporte

Si hay problemas con el seed, puedes:
1. Revisar los logs de Railway
2. Ejecutar manualmente: `POST /api/dev/seed-force`
3. Contactar al administrador del sistema