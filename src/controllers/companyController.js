import { Company } from '../models/company.js';
import { User } from '../models/users.js';
import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'

async function getCompanys(req, res) {
    try {
        // Si hay usuario autenticado, filtrar por userId; si no, devolver todas las empresas
        if (req.user && req.user.userId) {
            const company = await Company.findOne({
                where: { userId: req.user.userId }
            });
            if (!company) {
                return res.status(404).json({ mensaje: 'Empresa no encontrada para este usuario' });
            }
            return res.json([company]);
        } else {
            // Proceso de registro: devolver todas las empresas
            const companies = await Company.findAll();
            return res.json(companies);
        }
    } catch (error) {
        console.error('Error obteniendo empresa:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}
async function getCompany(req, res) {
    const { userId } = req.user;
    const { id } = req.params;
    console.log(userId)
    try {
        const company = await Company.findOne({
            where: {
                id:id,
            },
        });
        res.json(company);

    }catch(err){
        logger.error('Error getCompany: '+err);
        res.status(500).json({message: 'Server error getting Sdudent'})
    }
}

async function createCompany(req, res){
        const { userId } = req.user;
        // Recoger todos los campos obligatorios y opcionales
        const {
            name,
            code,
            city,
            address,
            phone,
            email,
            web,
            sector,
            main,
            description,
            type // <- Si existe en el modelo
        } = req.body;

        try {
            await sequelize.transaction(async (t) => {
                // Crear la empresa asociando el userId
                const company = await Company.create({
                    name,
                    code,
                    city,
                    address,
                    phone,
                    email,
                    web,
                    sector,
                    main,
                    description,
                    userId,
                    type: type || 'default' // Si el modelo requiere type
                }, { transaction: t });
                logger.info({ userId }, "Company created");
                res.json(company);
            });
        } catch (err) {
            logger.error('Error createCompany: ' + err);
            res.status(500).json({ message: 'Server error creating company' });
        }
}

async function updateCompany(req, res) {
    const { userId } = req.user;
    const { companyId } = req.params.id; // ID del centro en la URL
    const { name,code,city,address,
        phone,email} = req.body; // Datos a actualizar

  // Primero, verificar si el usuario está relacionado con el centro
    UserCompany.findOne({ where: { userId, companyId } })
    .then(relacion => {
        if (!relacion) {
        return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este centro' });
        }

      // Si la relación existe, proceder con la actualización
        return Company.update(name,code,city,address,
            phone,email, { where: { id: companyId } });
    })
    .then(() => res.json({ mensaje: 'Centro actualizado exitosamente' }))
    .catch(error => {
        console.error('Error al actualizar centro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    });
}

async function activateInactivate(req, res) {
    const { userId }= req.user;
    const {companyId} = req.params.id;
    const {active} = req.body;
    try {
        if(!active)   return res.status(400).json({message:'Active is required'});
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({message: 'company not found'});
        }
        UserCompany.findOne({ where: { userId, companyId } })
            .then(relacion => {
            if (!relacion) {
            return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este centro' });
            }
            if (company.active === active){
                return res
                    .status(400).json({message: 'User already has this status'});
            }
            // Si la relación existe, proceder con la actualización
            return Company.update(active, { where: { id: companyId } });
            })
            .then(() => res.json({ mensaje: 'Centro actualizado exitosamente' }))
            
    }catch(error){
        logger.error('Error activateInactivate: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

async function deleteCompany(req,res){
    const { userId }= req.user;
    const {companyId} = req.params;

    try{
        UserCompany.findOne({ where: { userId, companyId } })
            .then(relacion => {
            if (!relacion) {
            return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este centro' });
            }
            })
            const company = await Company.destroy({ done }, {where: { id, UserId:userId } });
            //destroy no es recomendado
            if (company[0] === 0)
                return res.status(404).json({message: 'Company not found'});
            res.json(company, { mensaje: 'Centro eliminado exitosamente' });
    
    }catch(err){
        logger.error('Error deleteCompany: '+err);
        res.status(500).json({message: 'Server error'})
    }
}
export default {
    getCompanys,
    getCompany,
    createCompany,
    updateCompany,
    activateInactivate,
    deleteCompany
}

