import sequelize from '../src/database/database.js';

/**
 * Migración para actualizar la tabla educations v2
 * - Agregar campos: profamilyId, newProfamilyName, isValidated, validationNotes
 * - Cambiar status por graduationStatus
 * - Actualizar valores por defecto
 */

async function updateEducationsTableV2() {
    try {
        console.log('🚀 Iniciando actualización v2 de tabla educations...');

        // Agregar columna profamilyId (foreign key)
        await sequelize.query(`
            ALTER TABLE educations
            ADD COLUMN IF NOT EXISTS "profamilyId" INTEGER REFERENCES profamilys(id)
        `);
        console.log('✅ Columna profamilyId agregada');

        // Agregar columna newProfamilyName
        await sequelize.query(`
            ALTER TABLE educations
            ADD COLUMN IF NOT EXISTS "newProfamilyName" VARCHAR(255)
        `);
        console.log('✅ Columna newProfamilyName agregada');

        // Agregar columna isValidated
        await sequelize.query(`
            ALTER TABLE educations
            ADD COLUMN IF NOT EXISTS "isValidated" BOOLEAN DEFAULT false
        `);
        console.log('✅ Columna isValidated agregada');

        // Agregar columna validationNotes
        await sequelize.query(`
            ALTER TABLE educations
            ADD COLUMN IF NOT EXISTS "validationNotes" TEXT
        `);
        console.log('✅ Columna validationNotes agregada');

        // Renombrar columna status a graduationStatus
        await sequelize.query(`
            ALTER TABLE educations
            RENAME COLUMN status TO "graduationStatus"
        `);
        console.log('✅ Columna status renombrada a graduationStatus');

        // Actualizar valores por defecto para graduationStatus
        await sequelize.query(`
            UPDATE educations
            SET "graduationStatus" = 'por_egresar'
            WHERE "graduationStatus" IS NULL
        `);
        console.log('✅ Valores por defecto actualizados para graduationStatus');

        console.log('✅ Tabla educations v2 actualizada exitosamente');
        console.log('📊 Nueva estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - institution (STRING, NOT NULL)');
        console.log('   - degree (STRING, NOT NULL)');
        console.log('   - career (STRING, NOT NULL)');
        console.log('   - graduationStatus (ENUM: por_egresar, egresado, licenciado)');
        console.log('   - profamilyId (FK -> profamilys.id)');
        console.log('   - newProfamilyName (STRING)');
        console.log('   - isValidated (BOOLEAN, DEFAULT false)');
        console.log('   - validationNotes (TEXT)');
        console.log('   - description (TEXT, NULLABLE)');
        console.log('   - studentId (FK -> students.id)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');

    } catch (error) {
        console.error('❌ Error al actualizar tabla educations v2:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await updateEducationsTableV2();

        console.log('\n🎉 Actualización v2 de tabla educations completada exitosamente');

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

export { updateEducationsTableV2 };