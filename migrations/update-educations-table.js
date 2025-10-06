import sequelize from '../src/database/database.js';

/**
 * Migración para actualizar la tabla educations
 * - Agregar campos: career, status
 * - Quitar campos: startDate, endDate
 */

async function updateEducationsTable() {
    try {
        console.log('🚀 Iniciando actualización de tabla educations...');

        // Agregar columna career
        await sequelize.query(`
            ALTER TABLE educations
            ADD COLUMN IF NOT EXISTS career VARCHAR(255) NOT NULL DEFAULT 'Carrera sin especificar'
        `);
        console.log('✅ Columna career agregada');

        // Crear tipo enum para status si no existe
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE education_status AS ENUM('por_egresar', 'egresado', 'licenciado');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Agregar columna status
        await sequelize.query(`
            ALTER TABLE educations
            ADD COLUMN IF NOT EXISTS status education_status NOT NULL DEFAULT 'por_egresar'
        `);
        console.log('✅ Columna status agregada');

        // Quitar columna startDate
        await sequelize.query(`
            ALTER TABLE educations
            DROP COLUMN IF EXISTS "startDate"
        `);
        console.log('✅ Columna startDate eliminada');

        // Quitar columna endDate
        await sequelize.query(`
            ALTER TABLE educations
            DROP COLUMN IF EXISTS "endDate"
        `);
        console.log('✅ Columna endDate eliminada');

        console.log('✅ Tabla educations actualizada exitosamente');
        console.log('📊 Nueva estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - institution (STRING, NOT NULL)');
        console.log('   - degree (STRING, NOT NULL)');
        console.log('   - career (STRING, NOT NULL)');
        console.log('   - status (ENUM: por_egresar, egresado, licenciado)');
        console.log('   - description (TEXT, NULLABLE)');
        console.log('   - studentId (FK -> students.id)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');

    } catch (error) {
        console.error('❌ Error al actualizar tabla educations:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await updateEducationsTable();

        console.log('\n🎉 Actualización de tabla educations completada exitosamente');

    } catch (error) {
        console.error('💥 Error en la actualización:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔐 Conexión a base de datos cerrada');
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { updateEducationsTable };