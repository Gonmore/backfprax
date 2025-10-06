import sequelize from '../src/database/database.js';
import { Experience } from '../src/models/experience.js';
import '../src/models/relations.js';

/**
 * Script para crear la tabla experiences
 * Esta tabla almacena la información laboral de los estudiantes
 */

async function createExperiencesTable() {
    try {
        console.log('🚀 Iniciando creación de tabla experiences...');

        // Sincronizar la tabla Experience
        await Experience.sync({ force: false });

        console.log('✅ Tabla experiences creada exitosamente');
        console.log('📊 Estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - company (STRING, NOT NULL)');
        console.log('   - position (STRING, NOT NULL)');
        console.log('   - startDate (DATEONLY, NOT NULL)');
        console.log('   - endDate (DATEONLY, NULLABLE)');
        console.log('   - description (TEXT, NULLABLE)');
        console.log('   - studentId (FK -> students.id)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');

        console.log('\n📋 Índices creados:');
        console.log('   - idx_experiences_student (studentId)');
        console.log('   - idx_experiences_start_date (startDate)');

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Probar APIs de experiencia laboral');
        console.log('   2. Integrar con el sistema de matching');

    } catch (error) {
        console.error('❌ Error al crear tabla experiences:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await createExperiencesTable();

        console.log('\n🎉 Creación de tabla experiences completada exitosamente');

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

export { createExperiencesTable };