# 🚨 CONFIGURACIÓN DE BASE DE DATOS LOCAL

## ❌ Problema Actual
La aplicación está intentando conectarse a Railway pero no tienes las credenciales correctas.

## 🛠️ Solución: Configurar Base de Datos Local

### Opción 1: PostgreSQL Local (Recomendado)

1. **Instalar PostgreSQL:**
   ```bash
   # Windows - usar chocolatey o descargar desde postgresql.org
   choco install postgresql
   # O descargar desde: https://www.postgresql.org/download/windows/
   ```

2. **Crear base de datos:**
   ```sql
   CREATE DATABASE ausbildung;
   CREATE USER ausbildung_user WITH PASSWORD 'password123';
   GRANT ALL PRIVILEGES ON DATABASE ausbildung TO ausbildung_user;
   ```

3. **Crear archivo `.env` en la carpeta `ausback`:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ausbildung
   DB_USER=ausbildung_user
   DB_PASSWORD=password123
   NODE_ENV=development
   ```

### Opción 2: SQLite (Más Simple)

Si no quieres instalar PostgreSQL, podemos cambiar temporalmente a SQLite.

1. **Crear archivo `.env`:**
   ```env
   DATABASE_URL=sqlite::memory:
   NODE_ENV=development
   ```

2. **Modificar `src/database/database.js`:**
   ```javascript
   // Agregar esta opción antes de la configuración actual
   if (process.env.DATABASE_URL?.startsWith('sqlite')) {
       console.log('🗄️ Using SQLite database');
       sequelizeConfig = {
           dialect: 'sqlite',
           storage: ':memory:',
           logging: console.log
       };
   }
   ```

### 🚀 Después de Configurar

1. **Ejecutar el seed:**
   ```bash
   cd ausback
   npm run seed
   ```

2. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

## 📋 Usuarios de Prueba
- **Empresa:** practicas@consultoriabcn.es / 123456
- **Backend URL:** http://localhost:5000

¿Cuál opción prefieres? ¿PostgreSQL o SQLite?