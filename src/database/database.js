import { Sequelize } from "sequelize";
import 'dotenv/config';

// Función para parsear DATABASE_URL de Railway
function parseDatabaseUrl(databaseUrl) {
    try {
        const url = new URL(databaseUrl);
        return {
            database: url.pathname.slice(1), // Remove leading slash
            username: url.username,
            password: url.password,
            host: url.hostname,
            port: url.port || 5432,
            dialect: 'postgres'
        };
    } catch (error) {
        console.error('Error parsing DATABASE_URL:', error);
        return null;
    }
}

// Configuración para Railway (DATABASE_URL) o variables separadas
let sequelizeConfig;

if (process.env.DATABASE_URL?.startsWith('sqlite')) {
    // SQLite para desarrollo rápido
    console.log('🗄️ Using SQLite database');
    sequelizeConfig = {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    };
} else if (process.env.DATABASE_URL) {
    // Railway proporciona DATABASE_URL
    console.log('🔗 Using Railway DATABASE_URL configuration');
    const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
    if (dbConfig) {
        sequelizeConfig = {
            ...dbConfig,
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                ssl: process.env.NODE_ENV === 'production' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            }
        };
    } else {
        throw new Error('Invalid DATABASE_URL format');
    }
} else {
    // Configuración tradicional con variables separadas
    console.log('🔧 Using traditional database configuration');
    sequelizeConfig = {
        database: process.env.DB_NAME || process.env.DB_DATABASE,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    };
}

const sequelize = new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, {
    host: sequelizeConfig.host,
    port: sequelizeConfig.port,
    dialect: sequelizeConfig.dialect,
    logging: sequelizeConfig.logging,
    pool: sequelizeConfig.pool,
    dialectOptions: sequelizeConfig.dialectOptions
});

export default sequelize;