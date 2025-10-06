import { Tutor } from '../models/tutor.js';
import { Scenter } from '../models/scenter.js';
import { Profamily } from '../models/profamily.js';
import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'

async function listTutors(req, res) {
    try {
        const tutors = await Tutor.findAll({
            include: [
                {
                    model: Scenter,
                    attributes: ['id', 'name', 'city']
                },
                {
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
                }
            ]
        });
        
        if (!tutors || tutors.length === 0) {
            return res.status(404).json({ mensaje: 'No hay tutores disponibles' });
        }
        
        return res.json(tutors);
    } catch (error) {
        console.error('Error obteniendo tutores:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

async function getTutor(req, res) {
    const { id } = req.params;
    
    try {
        const tutor = await Tutor.findByPk(id, {
            include: [
                {
                    model: Scenter,
                    attributes: ['id', 'name', 'city', 'address', 'phone', 'email']
                },
                {
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
                }
            ]
        });
        
        if (!tutor) {
            return res.status(404).json({ mensaje: 'Tutor no encontrado' });
        }
        
        res.json(tutor);
    } catch (err) {
        logger.error('Error getTutor: ' + err);
        res.status(500).json({ message: 'Error del servidor obteniendo el tutor' });
    }
}

async function createTutor(req, res) {
    const { userId } = req.user;
    const { id, name, email, grade, degree, scenterId, profamilyId } = req.body;
    
    try {
        const tutor = await Tutor.create({
            id, // El ID del tutor es proporcionado (puede ser DNI, código, etc.)
            name,
            email,
            grade,
            degree,
            tutorId: scenterId, // Foreign key hacia Scenter
            profamilyId
        });
        
        logger.info({ userId }, "Tutor created");
        res.json(tutor);
    } catch (err) {
        logger.error('Error createTutor: ' + err);
        res.status(500).json({ message: 'Error del servidor creando el tutor' });
    }
}

async function updateTutor(req, res) {
    const { userId } = req.user;
    const { id } = req.params;
    const { name, email, grade, degree, scenterId, profamilyId } = req.body;
    
    try {
        const tutor = await Tutor.findByPk(id);
        
        if (!tutor) {
            return res.status(404).json({ mensaje: 'Tutor no encontrado' });
        }
        
        await tutor.update({
            name,
            email,
            grade,
            degree,
            tutorId: scenterId, // Foreign key hacia Scenter
            profamilyId
        });
        
        logger.info({ userId }, "Tutor updated");
        res.json({ mensaje: 'Tutor actualizado exitosamente', tutor });
    } catch (error) {
        logger.error('Error updateTutor: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

async function deleteTutor(req, res) {
    const { userId } = req.user;
    const { id } = req.params;
    
    try {
        const tutor = await Tutor.findByPk(id);
        
        if (!tutor) {
            return res.status(404).json({ mensaje: 'Tutor no encontrado' });
        }
        
        await tutor.destroy();
        
        logger.info({ userId }, "Tutor deleted");
        res.json({ mensaje: 'Tutor eliminado exitosamente' });
    } catch (err) {
        logger.error('Error deleteTutor: ' + err);
        res.status(500).json({ message: 'Error del servidor eliminando el tutor' });
    }
}

// Endpoint adicional para obtener tutores por centro de estudios
async function getTutorsByScenter(req, res) {
    const { scenterId } = req.params;
    
    try {
        const tutors = await Tutor.findAll({
            where: { tutorId: scenterId },
            include: [
                {
                    model: Scenter,
                    attributes: ['id', 'name', 'city']
                },
                {
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
                }
            ]
        });
        
        res.json(tutors);
    } catch (error) {
        logger.error('Error getTutorsByScenter: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

// Endpoint adicional para obtener tutores por familia profesional
async function getTutorsByProfamily(req, res) {
    const { profamilyId } = req.params;
    
    try {
        const tutors = await Tutor.findAll({
            where: { profamilyId },
            include: [
                {
                    model: Scenter,
                    attributes: ['id', 'name', 'city']
                },
                {
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
                }
            ]
        });
        
        res.json(tutors);
    } catch (error) {
        logger.error('Error getTutorsByProfamily: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

export default {
    listTutors,
    getTutor,
    createTutor,
    updateTutor,
    deleteTutor,
    getTutorsByScenter,
    getTutorsByProfamily
}
