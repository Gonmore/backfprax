import sequelize from '../src/database/database.js';
import { EducationalInstitution } from '../src/models/educationalInstitution.js';
import '../src/models/relations.js';

/**
 * Script para crear la tabla educational_institutions
 * Esta tabla almacena las instituciones educativas disponibles
 */

async function createEducationalInstitutionsTable() {
    try {
        console.log('🚀 Iniciando creación de tabla educational_institutions...');

        // Sincronizar la tabla EducationalInstitution
        await EducationalInstitution.sync({ force: false });

        console.log('✅ Tabla educational_institutions creada exitosamente');
        console.log('📊 Estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - name (STRING, NOT NULL)');
        console.log('   - type (ENUM: university, institute, school, college, NOT NULL)');
        console.log('   - city (STRING, NOT NULL)');
        console.log('   - active (BOOLEAN, DEFAULT TRUE)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');

        console.log('\n📋 Índices creados:');
        console.log('   - idx_educational_institutions_type (type)');
        console.log('   - idx_educational_institutions_city (city)');
        console.log('   - idx_educational_institutions_active (active)');

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Ejecutar seed de instituciones educativas');
        console.log('   2. Probar APIs de instituciones educativas');
        console.log('   3. Integrar con el formulario de educación');

    } catch (error) {
        console.error('❌ Error al crear tabla educational_institutions:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await createEducationalInstitutionsTable();

        console.log('\n🎉 Creación de tabla educational_institutions completada exitosamente');

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

export { createEducationalInstitutionsTable };