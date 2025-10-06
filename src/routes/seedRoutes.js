import express from 'express';
import seedDatabase from '../database/seed.js';
import logger from '../logs/logger.js';

const router = express.Router();

// Endpoint para ejecutar el seed de la base de datos
router.post('/seed', async (req, res) => {
    try {
        logger.info('🌱 Ejecutando seed desde endpoint...');
        
        const result = await seedDatabase();
        
        res.status(200).json({
            message: 'Seed ejecutado exitosamente',
            data: result.data
        });
        
    } catch (error) {
        logger.error('Error ejecutando seed:', error);
        res.status(500).json({
            message: 'Error ejecutando seed',
            error: error.message
        });
    }
});

// Endpoint para verificar el estado de los datos
router.get('/status', async (req, res) => {
    try {
        const { User } = await import('../models/users.js');
        const { Company } = await import('../models/company.js');
        const { Scenter } = await import('../models/scenter.js');
        const { Offer } = await import('../models/offer.js');
        const { Student } = await import('../models/student.js');
        const { Profamily } = await import('../models/profamily.js');
        const { Tutor } = await import('../models/tutor.js');

        const counts = {
            users: await User.count(),
            companies: await Company.count(),
            scenters: await Scenter.count(),
            offers: await Offer.count(),
            students: await Student.count(),
            profamilies: await Profamily.count(),
            tutors: await Tutor.count()
        };

        res.status(200).json({
            message: 'Estado de la base de datos',
            data: counts,
            isEmpty: Object.values(counts).every(count => count === 0)
        });

    } catch (error) {
        logger.error('Error verificando estado:', error);
        res.status(500).json({
            message: 'Error verificando estado de la base de datos',
            error: error.message
        });
    }
});

export default router;
