import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import { User, Scenter,Student,Company,Tutor,Profamily,Cv,Offer} from '../models/relations.js'
import sequelize from '../database/database.js';


// Inicializa AdminJS con Sequelize
AdminJS.registerAdapter(AdminJSSequelize);

const adminJS = new AdminJS({
    databases: [sequelize],
    rootPath: '/admin',
    resources: [
        { resource: User },
        { resource: Scenter },
        { resource: Student },
        { resource: Company },
        { resource: Tutor},
        { resource: Profamily },
        { resource: Cv },
        { resource: Offer},
    ],
});

const router = express.Router();

// Crea una sesión de autenticación para AdminJS
const adminRouter = AdminJSExpress.buildRouter(adminJS);
// Usa el administrador en la ruta /admin
router.use(adminJS.options.rootPath, adminRouter);

export default router;