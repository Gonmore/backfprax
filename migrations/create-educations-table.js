import sequelize from '../src/database/database.js';
import { Education } from '../src/models/education.js';
import '../src/models/relations.js';

/**
 * Script para crear la tabla educations
 * Esta tabla almacena la información educativa de los estudiantes
 */

async function createEducationsTable() {
    try {
        console.log('🚀 Iniciando creación de tabla educations...');

        // Sincronizar la tabla Education
        await Education.sync({ force: false });

        console.log('✅ Tabla educations creada exitosamente');
        console.log('📊 Estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - institution (STRING, NOT NULL)');
        console.log('   - degree (STRING, NOT NULL)');
        console.log('   - startDate (DATEONLY, NOT NULL)');
        console.log('   - endDate (DATEONLY, NULLABLE)');
        console.log('   - description (TEXT, NULLABLE)');
        console.log('   - studentId (FK -> students.id)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');

        console.log('\n📋 Índices creados:');
        console.log('   - idx_educations_student (studentId)');
        console.log('   - idx_educations_start_date (startDate)');

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Probar APIs de educación');
        console.log('   2. Integrar con el sistema de matching');

    } catch (error) {
        console.error('❌ Error al crear tabla educations:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await createEducationsTable();

        console.log('\n🎉 Creación de tabla educations completada exitosamente');

    } catch (error) {
        console.error('💥 Error en la creación:', error);
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

export { createEducationsTable };