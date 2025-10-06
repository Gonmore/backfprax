// Endpoint temporal para asociar ofertas con empresas
import { Router } from 'express';
import { Company } from '../models/company.js';
import { Offer } from '../models/offer.js';
import { User } from '../models/users.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js';

const router = Router();

// Endpoint temporal para asociar todas las ofertas con una empresa
router.post('/associate-offers-company', async (req, res) => {
    try {
        // Obtener la primera empresa disponible si no se especifica una
        let company;
        
        if (req.body.companyUserId) {
            // Buscar la empresa por userId
            company = await Company.findOne({
                where: { userId: req.body.companyUserId }
            });
        } else {
            // Si no se especifica, tomar la primera empresa disponible
            company = await Company.findOne();
        }
        
        if (!company) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        
        // Obtener todas las ofertas
        const offers = await Offer.findAll();
        
        if (offers.length === 0) {
            return res.status(404).json({ message: 'No hay ofertas disponibles' });
        }
        
        // Asociar cada oferta con la empresa
        const associations = [];
        for (const offer of offers) {
            try {
                await offer.addCompany(company);
                associations.push({
                    offerId: offer.id,
                    offerName: offer.name,
                    companyId: company.id,
                    companyName: company.name
                });
            } catch (associationError) {
                logger.error(`Error associating offer ${offer.id} with company ${company.id}:`, associationError);
                // Continuar con las demás ofertas incluso si una falla
            }
        }
        
        logger.info(`Associated ${offers.length} offers with company ${company.name}`);
        
        res.status(200).json({
            message: 'Ofertas asociadas exitosamente',
            company: {
                id: company.id,
                name: company.name,
                userId: company.userId
            },
            associations: associations,
            total: associations.length
        });
        
    } catch (error) {
        logger.error('Error associating offers with company:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Endpoint para verificar asociaciones en la base de datos
router.get('/check-associations', async (req, res) => {
    try {
        // Verificar CompanyOffer
        const companyOfferAssociations = await sequelize.query(
            "SELECT * FROM CompanyOffer", 
            { type: sequelize.QueryTypes.SELECT }
        );
        
        // Verificar empresas
        const companies = await Company.findAll();
        
        // Verificar ofertas
        const offers = await Offer.findAll();
        
        // Verificar ofertas con empresas incluidas
        const offersWithCompanies = await Offer.findAll({
            include: [{
                model: Company,
                through: { attributes: [] }
            }]
        });
        
        res.json({
            companyOfferAssociations: companyOfferAssociations.length,
            companies: companies.length,
            offers: offers.length,
            offersWithCompanies: offersWithCompanies.map(offer => ({
                id: offer.id,
                name: offer.name,
                companiesCount: offer.Companies ? offer.Companies.length : 0,
                companies: offer.Companies ? offer.Companies.map(c => ({ id: c.id, name: c.name })) : []
            })),
            associations: companyOfferAssociations
        });
        
    } catch (error) {
        logger.error('Error checking associations:', error);
        res.status(500).json({ message: 'Error checking associations', error: error.message });
    }
});

// Endpoint para arreglar asociaciones User-Company existentes
router.post('/fix-user-company-associations', async (req, res) => {
    try {
        // Buscar todas las empresas que tienen userId pero no están asociadas en UserCompany
        const companies = await Company.findAll({
            include: [{
                model: User,
                through: { attributes: [] },
                required: false
            }]
        });
        
        let fixed = 0;
        
        for (const company of companies) {
            // Si la empresa no tiene usuarios asociados a través de UserCompany
            if (!company.users || company.users.length === 0) {
                // Buscar el usuario por el campo userId de la empresa (si existe)
                // Nota: Necesitamos verificar si Company tiene campo userId
                const users = await User.findAll({
                    where: { role: 'company' }
                });
                
                // Para este caso específico, vamos a asociar la empresa con el usuario más reciente
                // que tenga rol 'company' y que no tenga empresa asociada
                for (const user of users) {
                    const existingCompanies = await user.getCompanies();
                    if (existingCompanies.length === 0) {
                        await user.addCompany(company);
                        fixed++;
                        logger.info(`Fixed association: User ${user.id} -> Company ${company.id}`);
                        break; // Solo asociar con un usuario
                    }
                }
            }
        }
        
        res.json({
            message: 'Asociaciones User-Company corregidas',
            companiesFound: companies.length,
            associationsFixed: fixed
        });
        
    } catch (error) {
        logger.error('Error fixing User-Company associations:', error);
        res.status(500).json({ message: 'Error fixing associations', error: error.message });
    }
});

export default router;
