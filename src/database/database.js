import { Sequelize } from "sequelize";
import 'dotenv/config';


const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres', // Explicitly set dialect for Sequelize v4+
        logging: console.log,
        pool: {
            max: 5, // máximo 5 conexiones
            min: 0,
            acquire: 30000, // tiempo máximo para adquirir conexión
            idle: 10000 // tiempo máximo de inactividad
        }
    }

);


export default sequelize;