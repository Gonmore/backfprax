import { Scenter, Profamily, ScenterProfamily, User } from '../models/relations.js';
import logger from '../logs/logger.js';
import { Status } from '../constants/index.js';

/**
 * Obtener todos los scenters activos con sus profamilys
 */
export async function getActiveScenters(req, res) {
    try {
        const scenters = await Scenter.findAll({
            where: { active: true },
            include: [
                {
                    model: Profamily,
                    as: 'profamilys',
                    through: { attributes: [] }
                }
            ],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: scenters
        });

    } catch (error) {
        logger.error('Error getting active scenters:', error);
        res.status(500).json({ message: 'Error obteniendo centros de estudios' });
    }
}

/**
 * Obtener un scenter específico con sus profamilys
 */
export async function getScenterById(req, res) {
    const { id } = req.params;

    try {
        const scenter = await Scenter.findOne({
            where: { id, active: true },
            include: [
                {
                    model: Profamily,
                    as: 'profamilys',
                    through: { attributes: [] }
                }
            ]
        });

        if (!scenter) {
            return res.status(404).json({ message: 'Centro de estudios no encontrado' });
        }

        res.json({
            success: true,
            data: scenter
        });

    } catch (error) {
        logger.error('Error getting scenter:', error);
        res.status(500).json({ message: 'Error obteniendo centro de estudios' });
    }
}

/**
 * Agregar una profamily a un scenter
 */
export async function addProfamilyToScenter(req, res) {
    const { scenterId } = req.params;
    const { profamilyId } = req.body;
    const { userId, role } = req.user;

    try {
        const scenter = await Scenter.findByPk(scenterId);
        if (!scenter) {
            return res.status(404).json({ message: 'Centro de estudios no encontrado' });
        }

        const profamily = await Profamily.findByPk(profamilyId);
        if (!profamily) {
            return res.status(404).json({ message: 'Familia profesional no encontrada' });
        }

        if (role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para modificar este centro' });
        }

        const existingRelation = await ScenterProfamily.findOne({
            where: { scenterId, profamilyId }
        });

        if (existingRelation) {
            return res.status(409).json({ message: 'Esta familia profesional ya está asociada al centro' });
        }

        await ScenterProfamily.create({
            scenterId,
            profamilyId
        });

        logger.info({ userId, scenterId, profamilyId }, 'Profamily added to scenter');
        res.status(201).json({
            success: true,
            message: 'Familia profesional agregada al centro exitosamente'
        });

    } catch (error) {
        logger.error('Error adding profamily to scenter:', error);
        res.status(500).json({ message: 'Error agregando familia profesional al centro' });
    }
}

/**
 * Remover una profamily de un scenter
 */
export async function removeProfamilyFromScenter(req, res) {
    const { scenterId, profamilyId } = req.params;
    const { userId, role } = req.user;

    try {
        if (role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para modificar este centro' });
        }

        const relation = await ScenterProfamily.findOne({
            where: { scenterId, profamilyId }
        });

        if (!relation) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        await relation.destroy();

        logger.info({ userId, scenterId, profamilyId }, 'Profamily removed from scenter');
        res.json({
            success: true,
            message: 'Familia profesional removida del centro exitosamente'
        });

    } catch (error) {
        logger.error('Error removing profamily from scenter:', error);
        res.status(500).json({ message: 'Error removiendo familia profesional del centro' });
    }
}

/**
 * Obtener profamilys disponibles para agregar a un scenter
 */
export async function getAvailableProfamilysForScenter(req, res) {
    const { scenterId } = req.params;

    try {
        const associatedProfamilys = await ScenterProfamily.findAll({
            where: { scenterId },
            attributes: ['profamilyId']
        });

        const associatedIds = associatedProfamilys.map(rel => rel.profamilyId);

        const availableProfamilys = await Profamily.findAll({
            where: {
                id: { [require('sequelize').Op.notIn]: associatedIds }
            },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: availableProfamilys
        });

    } catch (error) {
        logger.error('Error getting available profamilys:', error);
        res.status(500).json({ message: 'Error obteniendo familias profesionales disponibles' });
    }
}

/**
 * Obtener scenters asociados a un usuario
 */
export async function getUserScenters(req, res) {
    const { userId } = req.user;

    try {
        const user = await User.findByPk(userId, {
            include: {
                model: Scenter,
                as: 'scenters',
                through: { attributes: [] },
                where: { active: true },
                required: false
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            data: user.scenters || []
        });

    } catch (error) {
        logger.error('Error getting user scenters:', error);
        res.status(500).json({ message: 'Error obteniendo centros del usuario' });
    }
}

/**
 * Crear un nuevo scenter
 */
export async function createScenter(req, res) {
    const { userId, role } = req.user;
    const { name, code, city, address, phone, email } = req.body;

    try {
        if (role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para crear centros de estudio' });
        }

        const scenter = await Scenter.create({
            name,
            code,
            city,
            address,
            phone,
            email,
            active: true
        });

        logger.info({ userId, scenterId: scenter.id }, 'Scenter created');
        res.status(201).json({
            success: true,
            data: scenter
        });

    } catch (error) {
        logger.error('Error creating scenter:', error);
        res.status(500).json({ message: 'Error creando centro de estudios' });
    }
}

/**
 * Actualizar un scenter
 */
export async function updateScenter(req, res) {
    const { id } = req.params;
    const { userId, role } = req.user;
    const { name, code, city, address, phone, email } = req.body;

    try {
        if (role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para actualizar centros' });
        }

        const scenter = await Scenter.findByPk(id);
        if (!scenter) {
            return res.status(404).json({ message: 'Centro de estudios no encontrado' });
        }

        await scenter.update({
            name,
            code,
            city,
            address,
            phone,
            email
        });

        logger.info({ userId, scenterId: id }, 'Scenter updated');
        res.json({
            success: true,
            data: scenter
        });

    } catch (error) {
        logger.error('Error updating scenter:', error);
        res.status(500).json({ message: 'Error actualizando centro de estudios' });
    }
}

/**
 * Activar/desactivar un scenter
 */
export async function toggleScenterStatus(req, res) {
    const { id } = req.params;
    const { userId, role } = req.user;
    const { active } = req.body;

    try {
        if (role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado para cambiar estado de centros' });
        }

        const scenter = await Scenter.findByPk(id);
        if (!scenter) {
            return res.status(404).json({ message: 'Centro de estudios no encontrado' });
        }

        await scenter.update({ active });

        logger.info({ userId, scenterId: id, active }, 'Scenter status changed');
        res.json({
            success: true,
            message: `Centro ${active ? 'activado' : 'desactivado'} exitosamente`
        });

    } catch (error) {
        logger.error('Error toggling scenter status:', error);
        res.status(500).json({ message: 'Error cambiando estado del centro' });
    }
}

export default {
    getActiveScenters,
    getScenterById,
    addProfamilyToScenter,
    removeProfamilyFromScenter,
    getAvailableProfamilysForScenter,
    getUserScenters,
    createScenter,
    updateScenter,
    toggleScenterStatus
};
