import { Profamily } from '../models/profamily.js';
import { Offer } from '../models/offer.js';
import { Student } from '../models/student.js';
import { Tutor } from '../models/tutor.js';
import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'

async function listProfamilies(req, res) {
    try {
        console.log('🔍 Obteniendo familias profesionales...');
        
        // Primero intentar consulta simple sin includes
        const profamilies = await Profamily.findAll();
        
        console.log(`📋 Familias profesionales encontradas: ${profamilies.length}`);
        
        if (!profamilies || profamilies.length === 0) {
            return res.status(200).json([]);
        }
        return res.json(profamilies);
    } catch (error) {
        console.error('❌ Error obteniendo familias profesionales:', error);
        console.error('Stack:', error.stack);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

async function getProfamily(req, res) {
    const { id } = req.params;
    
    try {
        const profamily = await Profamily.findByPk(id, {
            include: [
                {
                    model: Offer,
                    attributes: ['id', 'name', 'location', 'sector', 'description']
                },
                {
                    model: Student,
                    attributes: ['id', 'name', 'surname', 'email']
                },
                {
                    model: Tutor,
                    attributes: ['id', 'name', 'surname', 'email']
                }
            ]
        });
        
        if (!profamily) {
            return res.status(404).json({ mensaje: 'Familia profesional no encontrada' });
        }
        
        res.json(profamily);
    } catch (err) {
        logger.error('Error getProfamily: ' + err);
        res.status(500).json({ message: 'Error del servidor obteniendo la familia profesional' });
    }
}

async function createProfamily(req, res) {
    const { userId } = req.user;
    const { name, description } = req.body;
    
    try {
        const profamily = await Profamily.create({
            name, 
            description
        });
        
        logger.info({ userId }, "Profamily created");
        res.json(profamily);
    } catch (err) {
        logger.error('Error createProfamily: ' + err);
        res.status(500).json({ message: 'Error del servidor creando la familia profesional' });
    }
}

async function updateProfamily(req, res) {
    const { userId } = req.user;
    const { id } = req.params;
    const { name, description } = req.body;
    
    try {
        const profamily = await Profamily.findByPk(id);
        
        if (!profamily) {
            return res.status(404).json({ mensaje: 'Familia profesional no encontrada' });
        }
        
        await profamily.update({
            name, 
            description
        });
        
        logger.info({ userId }, "Profamily updated");
        res.json({ mensaje: 'Familia profesional actualizada exitosamente', profamily });
    } catch (error) {
        logger.error('Error updateProfamily: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

async function deleteProfamily(req, res) {
    const { userId } = req.user;
    const { id } = req.params;
    
    try {
        const profamily = await Profamily.findByPk(id);
        
        if (!profamily) {
            return res.status(404).json({ mensaje: 'Familia profesional no encontrada' });
        }
        
        // Verificar si hay ofertas, estudiantes o tutores asociados
        const associatedOffers = await Offer.count({ where: { profamilyId: id } });
        const associatedStudents = await Student.count({ where: { profamilyId: id } });
        const associatedTutors = await Tutor.count({ where: { profamilyId: id } });
        
        if (associatedOffers > 0 || associatedStudents > 0 || associatedTutors > 0) {
            return res.status(400).json({ 
                mensaje: 'No se puede eliminar la familia profesional porque tiene ofertas, estudiantes o tutores asociados' 
            });
        }
        
        await profamily.destroy();
        
        logger.info({ userId }, "Profamily deleted");
        res.json({ mensaje: 'Familia profesional eliminada exitosamente' });
    } catch (err) {
        logger.error('Error deleteProfamily: ' + err);
        res.status(500).json({ message: 'Error del servidor eliminando la familia profesional' });
    }
}

// Endpoint adicional para obtener estudiantes por familia profesional
async function getStudentsByProfamily(req, res) {
    const { id } = req.params;
    
    try {
        const profamily = await Profamily.findByPk(id, {
            include: {
                model: Student,
                attributes: ['id', 'name', 'surname', 'email', 'phone']
            }
        });
        
        if (!profamily) {
            return res.status(404).json({ mensaje: 'Familia profesional no encontrada' });
        }
        
        res.json(profamily.Students);
    } catch (error) {
        logger.error('Error getStudentsByProfamily: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

// Endpoint adicional para obtener tutores por familia profesional
async function getTutorsByProfamily(req, res) {
    const { id } = req.params;
    
    try {
        const profamily = await Profamily.findByPk(id, {
            include: {
                model: Tutor,
                attributes: ['id', 'name', 'surname', 'email', 'phone']
            }
        });
        
        if (!profamily) {
            return res.status(404).json({ mensaje: 'Familia profesional no encontrada' });
        }
        
        res.json(profamily.Tutors);
    } catch (error) {
        logger.error('Error getTutorsByProfamily: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

export default {
    listProfamilies,
    getProfamily,
    createProfamily,
    updateProfamily,
    deleteProfamily,
    getStudentsByProfamily,
    getTutorsByProfamily
}
