import app from '../app';
import sequelize from './database/database'
import 'dotenv/config'
import logger from './logs/logger.js'

const { User, Scenter,Student,Company,Tutor,Cv,Profamily,Offer} = require('./src/models/relations');

//Iniciando relaciones de DB 
sequelize.sync({ force: true }).then(async () => {
    console.log("Base de datos sincronizada")})