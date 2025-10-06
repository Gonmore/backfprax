import sequelize from '../src/database/database.js';

async function updateCvTable() {
    try {
        console.log('🚀 Iniciando actualización de tabla cvs...');

        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        const queryInterface = sequelize.getQueryInterface();

        // Hacer backup de datos existentes
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS cvs_backup AS
            SELECT * FROM cvs;
        `);
        console.log('✅ Backup creado');

        // Agregar nuevas columnas una por una para evitar errores
        const columns = [
            { name: 'studentId', type: 'INTEGER', allowNull: true },
            { name: 'title', type: 'VARCHAR(255)', allowNull: true },
            { name: 'summary', type: 'TEXT', allowNull: true },
            { name: 'contactEmail', type: 'VARCHAR(255)', allowNull: true },
            { name: 'contactPhone', type: 'VARCHAR(255)', allowNull: true },
            { name: 'isComplete', type: 'BOOLEAN', default: 'false' },
            { name: 'lastUpdated', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
            { name: 'availability', type: 'VARCHAR(50)', default: "'flexible'" }
        ];

        for (const col of columns) {
            try {
                await sequelize.query(`
                    ALTER TABLE cvs
                    ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}
                    ${col.allowNull ? '' : 'NOT NULL'}
                    ${col.default ? `DEFAULT ${col.default}` : ''}
                `);
                console.log(`✅ Columna ${col.name} agregada`);
            } catch (error) {
                console.log(`⚠️  Columna ${col.name} ya existe o error:`, error.message);
            }
        }

        // Agregar columnas JSON
        const jsonColumns = [
            'professionalOrientation',
            'academicBackground',
            'skills',
            'workExperience',
            'workPreferences'
        ];

        for (const col of jsonColumns) {
            try {
                await sequelize.query(`
                    ALTER TABLE cvs
                    ADD COLUMN IF NOT EXISTS "${col}" JSON
                    DEFAULT '{}'
                `);
                console.log(`✅ Columna JSON ${col} agregada`);
            } catch (error) {
                console.log(`⚠️  Columna JSON ${col} ya existe o error:`, error.message);
            }
        }

        console.log('🎉 Actualización de tabla cvs completada exitosamente');

    } catch (error) {
        console.error('❌ Error al actualizar tabla cvs:', error);
        throw error;
    } finally {
        await sequelize.close();
        console.log('🔐 Conexión cerrada');
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    updateCvTable()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('💥 Error fatal:', error);
            process.exit(1);
        });
}

export { updateCvTable };