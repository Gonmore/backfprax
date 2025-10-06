import sequelize from '../src/database/database.js';
import { Student } from '../src/models/student.js';
import '../src/models/relations.js';

/**
 * Script para actualizar la tabla students y agregar graduationStatus
 * Esta migración añade el estado de graduación del estudiante
 */

async function addGraduationStatusToStudents() {
    try {
        console.log('🚀 Iniciando actualización de tabla students...');

        // Verificar si la columna ya existe
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('students');

        if (!tableDescription.graduationStatus) {
            console.log('📝 Agregando columna graduationStatus a students...');

            await queryInterface.addColumn('students', 'graduationStatus', {
                type: sequelize.Sequelize.ENUM('por_egresar', 'egresado', 'titulado'),
                allowNull: true,
                defaultValue: null
            });

            console.log('✅ Columna graduationStatus agregada exitosamente');
        } else {
            console.log('ℹ️ La columna graduationStatus ya existe');
        }

        console.log('✅ Actualización de tabla students completada');
        console.log('📊 Nueva estructura de la tabla incluye:');
        console.log('   - graduationStatus (ENUM: por_egresar, egresado, titulado, NULLABLE)');

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Ejecutar seed de datos iniciales si es necesario');
        console.log('   2. Verificar integridad de datos');

    } catch (error) {
        console.error('❌ Error al actualizar tabla students:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await addGraduationStatusToStudents();

        console.log('\n🎉 Actualización de tabla students completada exitosamente');

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

export { addGraduationStatusToStudents };