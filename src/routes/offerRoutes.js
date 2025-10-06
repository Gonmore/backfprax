import { Router } from 'express';
import offerController from '../controllers/offerController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Rutas principales para ofertas
router.route('/')
    .get(offerController.listOffers)  // Listar todas las ofertas (público)
    .post(authenticateJWT, offerController.createOffer);  // Crear nueva oferta (autenticado)

// Rutas específicas ANTES de las rutas con parámetros
router.route('/company')
    .get(authenticateJWT, offerController.getMyCompanyOffers);  // Obtener ofertas de mi empresa

// 🎯 NUEVA RUTA: Ofertas con cálculo de aptitud para estudiantes
router.route('/with-aptitude')
    .get(authenticateJWT, offerController.getOffersWithAptitude);

router.route('/company/:companyId')
    .get(offerController.getOffersByCompany);  // Obtener ofertas por empresa

router.route('/profamily/:profamilyId')
    .get(offerController.getOffersByProfamily);  // Obtener ofertas por familia profesional

// Nueva ruta para obtener ofertas con aplicaciones
router.route('/my-offers/applications')
    .get(authenticateJWT, offerController.getCompanyOffersWithApplications);  // Obtener ofertas de la empresa con aplicaciones

// NUEVA RUTA: Ofertas con candidatos y valoración
router.route('/company-with-candidates')
    .get(authenticateJWT, offerController.getCompanyOffersWithCandidates);

// 🔥 NUEVA RUTA: Obtener aplicaciones de una oferta específica
router.route('/:offerId/applications')
    .get(authenticateJWT, offerController.getApplicationsByOffer);

// Rutas con parámetros /:id DEBEN IR AL FINAL
router.route('/:id')
    .get(offerController.getOffer)  // Obtener oferta específica (público)
    .put(authenticateJWT, offerController.updateOffer)  // Actualizar oferta (autenticado)
    .delete(authenticateJWT, offerController.deleteOffer);  // Eliminar oferta (autenticado)

export default router;
