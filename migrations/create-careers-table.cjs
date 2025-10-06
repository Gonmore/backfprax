import sequelize from '../src/database/database.js';
import { Career } from '../src/models/career.js';

/**
 * Script para crear la tabla careers
 * Esta tabla almacena las carreras disponibles por familia profesional
 */

async function createCareersTable() {
    try {
        console.log('🚀 Iniciando creación de tabla careers...');

        // Sincronizar la tabla Career
        await Career.sync({ force: false });

        console.log('✅ Tabla careers creada exitosamente');
        console.log('📊 Estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - name (STRING, NOT NULL)');
        console.log('   - description (TEXT, NULLABLE)');
        console.log('   - profamilyId (FK -> profamilys.id)');
        console.log('   - isActive (BOOLEAN, DEFAULT TRUE)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');

        console.log('\n📋 Índices creados:');
        console.log('   - idx_careers_profamily (profamilyId)');
        console.log('   - idx_careers_active (isActive)');

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Poblar tabla con carreras por familia profesional');
        console.log('   2. Actualizar APIs para usar esta tabla');

    } catch (error) {
        console.error('❌ Error al crear tabla careers:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await createCareersTable();

        console.log('\n🎉 Creación de tabla careers completada exitosamente');

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

export { createCareersTable };