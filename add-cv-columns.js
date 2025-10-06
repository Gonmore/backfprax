import sequelize from './src/database/database.js';

async function addCvColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');

        // Agregar columnas una por una
        const queries = [
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "title" VARCHAR(255)`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "summary" TEXT`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "contactEmail" VARCHAR(255)`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR(255)`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "professionalOrientation" JSON DEFAULT '{}'`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "academicBackground" JSON DEFAULT '[]'`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "skills" JSON DEFAULT '[]'`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "workExperience" JSON DEFAULT '[]'`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "isComplete" BOOLEAN DEFAULT false`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "availability" VARCHAR(50) DEFAULT 'flexible'`,
            `ALTER TABLE cvs ADD COLUMN IF NOT EXISTS "workPreferences" JSON DEFAULT '{}'`
        ];

        for (const query of queries) {
            try {
                await sequelize.query(query);
                console.log(`✅ Ejecutado: ${query.split('ADD COLUMN')[1]?.trim() || query}`);
            } catch (error) {
                console.log(`⚠️  Error en query: ${error.message}`);
            }
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addCvColumns();