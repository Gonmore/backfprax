import sequelize from "../database/database.js";
import logger from '../logs/logger.js';

async function cleanDatabase() {
    try {
        logger.info('🧹 Limpiando tablas problemáticas...');

        // Eliminar las tablas problemáticas
        await sequelize.query('DROP TABLE IF EXISTS "applications" CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS "company_tokens" CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS "token_usages" CASCADE;');
        
        // Eliminar los tipos ENUM problemáticos
        await sequelize.query('DROP TYPE IF EXISTS "enum_applications_status" CASCADE;');
        await sequelize.query('DROP TYPE IF EXISTS "enum_token_usages_action" CASCADE;');

        logger.info('✅ Tablas eliminadas exitosamente');
        
    } catch (error) {
        logger.error('Error limpiando base de datos: ' + error);
    } finally {
        await sequelize.close();
    }
}

cleanDatabase();
