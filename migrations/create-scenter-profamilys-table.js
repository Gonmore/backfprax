import sequelize from '../src/database/database.js';

/**
 * Migración para crear tabla scenter_profamilys y actualizar educations
 * - Crear tabla scenter_profamilys (relación muchos-a-muchos)
 * - Cambiar institution por scenterId en educations
 * - Actualizar enum de graduationStatus
 */

async function createScenterProfamilyTable() {
    try {
        console.log('🚀 Iniciando migración de scenter-profamilys...');

        // Crear tabla scenter_profamilys
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS scenter_profamilys (
                id SERIAL PRIMARY KEY,
                scenterId INTEGER NOT NULL REFERENCES scenters(id) ON DELETE CASCADE,
                profamilyId INTEGER NOT NULL REFERENCES profamilys(id) ON DELETE CASCADE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(scenterId, profamilyId)
            )
        `);
        console.log('✅ Tabla scenter_profamilys creada');

        // Agregar columna scenterId a educations
        await sequelize.query(`
            ALTER TABLE educations
            ADD COLUMN IF NOT EXISTS "scenterId" INTEGER REFERENCES scenters(id)
        `);
        console.log('✅ Columna scenterId agregada a educations');

        // Actualizar el enum de graduationStatus
        await sequelize.query(`
            ALTER TYPE education_status RENAME VALUE 'titled' TO 'licenciado';
            ALTER TYPE education_status RENAME VALUE 'graduated' TO 'egresado';
            ALTER TYPE education_status RENAME VALUE 'about-to-graduate' TO 'por_egresar';
        `).catch(err => {
            // Si el enum ya está actualizado, ignorar el error
            if (!err.message.includes('already exists')) {
                throw err;
            }
        });
        console.log('✅ Enum graduationStatus actualizado');

        // Hacer scenterId nullable inicialmente para migración
        await sequelize.query(`
            ALTER TABLE educations
            ALTER COLUMN "scenterId" DROP NOT NULL
        `);
        console.log('✅ Columna scenterId configurada como nullable');

        console.log('✅ Migración de scenter-profamilys completada exitosamente');

    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await createScenterProfamilyTable();

        console.log('\n🎉 Migración completada exitosamente');

    } catch (error) {
        console.error('💥 Error en la migración:', error);
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

export { createScenterProfamilyTable };