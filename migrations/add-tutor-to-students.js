import sequelize from '../src/database/database.js';
import { Student } from '../src/models/student.js';
import '../src/models/relations.js';

/**
 * Script para actualizar la tabla students y agregar tutorId
 * Esta migración añade la relación con tutors
 */

async function addTutorToStudents() {
    try {
        console.log('🚀 Iniciando actualización de tabla students...');

        // Verificar si la columna ya existe
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('students');

        if (!tableDescription.tutorId) {
            console.log('📝 Agregando columna tutorId a students...');

            await queryInterface.addColumn('students', 'tutorId', {
                type: sequelize.Sequelize.STRING,
                allowNull: true,
                references: {
                    model: 'tutors',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });

            console.log('✅ Columna tutorId agregada exitosamente');
        } else {
            console.log('ℹ️ La columna tutorId ya existe');
        }

        // Crear índice si no existe
        try {
            await queryInterface.addIndex('students', ['tutorId'], {
                name: 'idx_students_tutor'
            });
            console.log('📋 Índice idx_students_tutor creado');
        } catch (indexError) {
            console.log('ℹ️ Índice ya existe o error al crear:', indexError.message);
        }

        console.log('✅ Actualización de tabla students completada');
        console.log('📊 Nueva estructura de la tabla incluye:');
        console.log('   - tutorId (FK -> tutors.id, NULLABLE)');

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

        await addTutorToStudents();

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
} else {
    main();
}

export { addTutorToStudents };