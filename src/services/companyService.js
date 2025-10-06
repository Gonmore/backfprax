import { Company, User, Offer, Application, Student, Profamily, UserCompany } from '../models/relations.js';
import { AffinityCalculator } from './affinityCalculator.js';
import logger from '../logs/logger.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyOfferWithCandidates:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la oferta
 *         name:
 *           type: string
 *           description: Nombre de la oferta
 *         location:
 *           type: string
 *           description: Ubicación de la oferta
 *         mode:
 *           type: string
 *           enum: [presencial, remoto, hibrido]
 *         type:
 *           type: string
 *           enum: [practica, contrato, formacion]
 *         candidates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CandidateWithAffinity'
 *         candidateStats:
 *           $ref: '#/components/schemas/CandidateStats'
 *         Company:
 *           $ref: '#/components/schemas/Company'
 *     
 *     CandidateWithAffinity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la aplicación
 *         status:
 *           type: string
 *           enum: [pending, reviewed, accepted, rejected, withdrawn]
 *         appliedAt:
 *           type: string
 *           format: date-time
 *         student:
 *           $ref: '#/components/schemas/StudentWithUser'
 *         affinity:
 *           $ref: '#/components/schemas/AffinityResult'
 *     
 *     CandidateStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de candidatos
 *         byStatus:
 *           type: object
 *           properties:
 *             pending:
 *               type: integer
 *             reviewed:
 *               type: integer
 *             accepted:
 *               type: integer
 *             rejected:
 *               type: integer
 *             withdrawn:
 *               type: integer
 *         byAffinity:
 *           type: object
 *           properties:
 *             'muy alto':
 *               type: integer
 *             'alto':
 *               type: integer
 *             'medio':
 *               type: integer
 *             'bajo':
 *               type: integer
 *             'sin datos':
 *               type: integer
 *     
 *     AffinityResult:
 *       type: object
 *       properties:
 *         level:
 *           type: string
 *           enum: ['muy alto', 'alto', 'medio', 'bajo', 'sin datos']
 *         score:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         matches:
 *           type: integer
 *           description: Número de habilidades coincidentes
 *         coverage:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Porcentaje de cobertura de requisitos
 *         explanation:
 *           type: string
 *           description: Explicación legible de la afinidad
 *         matchedSkills:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de habilidades coincidentes
 */

class CompanyService {
    constructor() {
        // 🔥 AGREGAR INICIALIZACIÓN DEL AFFINITY CALCULATOR
        this.affinityCalculator = new AffinityCalculator();
        logger.info('CompanyService initialized');
    }

    /**
     * Obtener empresa asociada a un usuario específico
     */
    async getCompanyByUserId(userId) {
        const startTime = Date.now();
        
        try {
            logger.info({ userId }, "Searching for company by userId");

            const userCompany = await UserCompany.findOne({
                where: { 
                    userId,
                    isActive: true 
                },
                include: [{
                    model: Company,
                    as: 'company' // 🔥 AGREGAR EL ALIAS 'company'
                }]
            });

            // 🔥 DEBUG TEMPORAL
            console.log('🔍 DEBUG userCompany:', JSON.stringify(userCompany, null, 2));
            console.log('🔍 DEBUG userCompany keys:', userCompany ? Object.keys(userCompany.dataValues) : 'null');

            const duration = `${Date.now() - startTime}ms`;

            if (!userCompany) {
                logger.error({ userId, duration }, "No se encontró empresa para el usuario");
                throw new Error(`No se encontró empresa para el usuario ${userId}`);
            }

            // 🔥 AHORA USAR EL ALIAS CORRECTO
            const company = userCompany.company; // Ya no buscar en Company con mayúscula
            
            if (!company) {
                console.log('❌ No se encontró company en userCompany');
                throw new Error(`No se encontró empresa asociada para el usuario ${userId}`);
            }

            logger.info({ 
                userId, 
                companyId: company.id,
                companyName: company.name,
                duration 
            }, "Company found successfully");

            return {
                ...company.toJSON(),
                userRole: userCompany.role,
                assignedAt: userCompany.assignedAt
            };

        } catch (error) {
            const duration = `${Date.now() - startTime}ms`;
            logger.error({ 
                userId, 
                duration,
                stack: error.stack,
                error: error.message 
            }, "Error finding company by userId");
            throw error;
        }
    }

    /**
     * Obtener ofertas de empresa con aplicaciones y candidatos
     * @param {number} userId - ID del usuario de la empresa
     * @returns {Promise<Array>} Array de ofertas con candidatos y afinidad
     */
    async getCompanyOffersWithCandidates(userId) {
        const startTime = Date.now();
        const operationId = `getOffers_${userId}_${Date.now()}`;
        
        try {
            logger.info({ userId, operationId }, 'Starting getCompanyOffersWithCandidates operation');
            
            // 1. Validar y obtener empresa
            const company = await this.getCompanyByUserId(userId);
            
            logger.debug({ 
                userId, 
                companyId: company.id, 
                companyName: company.name,
                operationId
            }, 'Company validated, loading offers');

            // 2. Obtener ofertas de la empresa
            const offers = await this._loadCompanyOffers(company.id, operationId);
            
            // 3. Obtener aplicaciones para todas las ofertas
            const applications = await this._loadApplicationsForOffers(company.id, offers, operationId);
            
            // 4. Procesar ofertas con candidatos y afinidad
            const processedOffers = this._processOffersWithAffinity(offers, applications, operationId);

            const duration = Date.now() - startTime;
            const totalCandidates = processedOffers.reduce((sum, offer) => sum + offer.candidateStats.total, 0);
            
            logger.info({ 
                userId,
                companyId: company.id, 
                operationId,
                offersCount: processedOffers.length,
                totalCandidates,
                duration: `${duration}ms`,
                performance: {
                    avgCandidatesPerOffer: Math.round(totalCandidates / processedOffers.length || 0),
                    offersWithCandidates: processedOffers.filter(o => o.candidateStats.total > 0).length
                }
            }, 'CompanyOffersWithCandidates operation completed successfully');

            return processedOffers;

        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error({ 
                userId, 
                operationId,
                error: error.message,
                duration: `${duration}ms`,
                stack: error.stack
            }, 'Error in getCompanyOffersWithCandidates operation');
            throw error;
        }
    }

    /**
     * Cargar ofertas de la empresa con relaciones
     * @private
     */
    async _loadCompanyOffers(companyId, operationId) {
        const startTime = Date.now();
        
        try {
            logger.debug({ companyId, operationId }, 'Loading company offers');
            
            const offers = await Offer.findAll({
                where: { companyId },
                include: [
                    {
                        model: Company,
                        attributes: ['id', 'name', 'sector', 'city', 'code']
                    },
                    {
                        model: Profamily,
                        attributes: ['id', 'name', 'description'],
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const duration = Date.now() - startTime;
            logger.debug({ 
                companyId, 
                operationId,
                offersCount: offers.length,
                duration: `${duration}ms`
            }, 'Company offers loaded successfully');
            
            return offers;
            
        } catch (error) {
            logger.error({ 
                companyId, 
                operationId,
                error: error.message 
            }, 'Error loading company offers');
            throw error;
        }
    }

    /**
     * Cargar aplicaciones para las ofertas
     * @private
     */
    async _loadApplicationsForOffers(companyId, offers, operationId) {
        const startTime = Date.now();
        
        try {
            const offerIds = offers.map(offer => offer.id);
            
            if (offerIds.length === 0) {
                logger.debug({ companyId, operationId }, 'No offers found, skipping applications load');
                return [];
            }

            logger.debug({ 
                companyId, 
                operationId,
                offerIds 
            }, 'Loading applications for offers');
            
            const applications = await Application.findAll({
                where: { 
                    offerId: offerIds,
                    companyId
                },
                include: [
                    {
                        model: Student,
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'surname', 'email', 'phone']
                            },
                            {
                                model: Profamily,
                                attributes: ['id', 'name', 'description'],
                                as: 'profamily',
                                required: false
                            }
                        ]
                    }
                ],
                order: [['appliedAt', 'DESC']]
            });

            const duration = Date.now() - startTime;
            logger.debug({ 
                companyId, 
                operationId,
                applicationsCount: applications.length,
                duration: `${duration}ms`,
                applicationsByOffer: applications.reduce((acc, app) => {
                    acc[app.offerId] = (acc[app.offerId] || 0) + 1;
                    return acc;
                }, {})
            }, 'Applications loaded successfully');
            
            return applications;
            
        } catch (error) {
            logger.error({ 
                companyId, 
                operationId,
                error: error.message 
            }, 'Error loading applications for offers');
            throw error;
        }
    }

    /**
     * Procesar ofertas con cálculo de afinidad
     * @private
     */
    _processOffersWithAffinity(offers, applications, operationId) {
        const startTime = Date.now();
        
        try {
            logger.debug({ 
                operationId,
                offersCount: offers.length,
                applicationsCount: applications.length 
            }, 'Processing offers with affinity calculation');
            
            const processedOffers = offers.map(offer => {
                const offerStartTime = Date.now();
                
                // ELIMINADO: Skills ahora vienen de la relación profesional OfferSkill
                const offerSkills = {}; // Ya no se usan tags hardcodeados
                
                // Filtrar aplicaciones para esta oferta
                const offerApplications = applications.filter(app => app.offerId === offer.id);
                
                logger.debug({ 
                    operationId,
                    offerId: offer.id,
                    offerName: offer.name,
                    applicationsCount: offerApplications.length,
                    offerSkills: Object.keys(offerSkills)
                }, 'Processing offer with applications');
                
                // Procesar candidatos con afinidad
                const candidatesWithAffinity = this._processCandidatesWithAffinity(
                    offerApplications, 
                    offerSkills, 
                    operationId,
                    offer.id
                );

                // Calcular estadísticas
                const candidateStats = this._calculateCandidateStats(candidatesWithAffinity);

                const offerDuration = Date.now() - offerStartTime;
                logger.debug({ 
                    operationId,
                    offerId: offer.id,
                    candidatesProcessed: candidatesWithAffinity.length,
                    stats: candidateStats,
                    duration: `${offerDuration}ms`
                }, 'Offer processed with affinity');

                return {
                    id: offer.id,
                    name: offer.name,
                    location: offer.location,
                    mode: offer.mode,
                    type: offer.type,
                    period: offer.period,
                    schedule: offer.schedule,
                    min_hr: offer.min_hr,
                    car: offer.car,
                    sector: offer.sector,
                    // ELIMINADO: tag hardcodeado reemplazado por skills profesionales
                    description: offer.description,
                    jobs: offer.jobs,
                    requisites: offer.requisites,
                    createdAt: offer.createdAt,
                    Company: offer.Company,
                    Profamily: offer.Profamily,
                    candidates: candidatesWithAffinity,
                    candidateStats,
                    offerSkills,
                    metadata: {
                        processedAt: new Date().toISOString(),
                        processingDuration: `${offerDuration}ms`,
                        affinityCalculated: candidatesWithAffinity.some(c => c.affinity.level !== 'sin datos')
                    }
                };
            });

            const duration = Date.now() - startTime;
            logger.info({ 
                operationId,
                offersProcessed: processedOffers.length,
                totalCandidates: processedOffers.reduce((sum, offer) => sum + offer.candidateStats.total, 0),
                duration: `${duration}ms`
            }, 'All offers processed with affinity successfully');
            
            return processedOffers;
            
        } catch (error) {
            logger.error({ 
                operationId,
                error: error.message 
            }, 'Error processing offers with affinity');
            throw error;
        }
    }

    /**
     * Procesar candidatos con cálculo de afinidad
     * @private
     */
    _processCandidatesWithAffinity(applications, offerSkills, operationId, offerId) {
        try {
            const validApplications = applications.filter(app => app.Student?.User);
            
            if (validApplications.length === 0) {
                logger.debug({ operationId, offerId }, 'No valid applications found for offer');
                return [];
            }

            const candidates = validApplications.map(application => {
                const student = application.Student;
                const studentSkills = this._parseStudentSkills(student.tag);
                
                // Calcular afinidad
                const affinity = Object.keys(offerSkills).length > 0 
                    ? this.affinityCalculator.calculateAffinity(offerSkills, studentSkills)
                    : this.affinityCalculator.getDefaultAffinity();

                logger.debug({ 
                    operationId,
                    offerId,
                    applicationId: application.id,
                    studentEmail: student.User.email,
                    affinity: {
                        level: affinity.level,
                        score: affinity.score,
                        matches: affinity.matches
                    }
                }, 'Candidate affinity calculated');

                return {
                    id: application.id,
                    status: application.status,
                    appliedAt: application.appliedAt,
                    reviewedAt: application.reviewedAt,
                    message: application.message,
                    companyNotes: application.companyNotes,
                    rejectionReason: application.rejectionReason,
                    student: {
                        id: student.id,
                        grade: student.grade,
                        course: student.course,
                        car: student.car,
                        tag: student.tag,
                        description: student.description,
                        active: student.active,
                        User: student.User,
                        profamily: student.profamily
                    },
                    affinity
                };
            });

            // Ordenar por afinidad
            return this._sortCandidatesByAffinity(candidates);
            
        } catch (error) {
            logger.error({ 
                operationId,
                offerId,
                error: error.message 
            }, 'Error processing candidates with affinity');
            return [];
        }
    }

    /**
     * Ordenar candidatos por afinidad
     * @private
     */
    _sortCandidatesByAffinity(candidates) {
        const levelOrder = { "muy alto": 4, "alto": 3, "medio": 2, "bajo": 1, "sin datos": 0 };
        
        return candidates.sort((a, b) => {
            // Primero por nivel de afinidad
            if (levelOrder[a.affinity.level] !== levelOrder[b.affinity.level]) {
                return levelOrder[b.affinity.level] - levelOrder[a.affinity.level];
            }
            // Luego por score
            if (a.affinity.score !== b.affinity.score) {
                return b.affinity.score - a.affinity.score;
            }
            // Finalmente por fecha de aplicación (más reciente primero)
            return new Date(b.appliedAt) - new Date(a.appliedAt);
        });
    }

    /**
     * Calcular estadísticas de candidatos
     * @private
     */
    _calculateCandidateStats(candidates) {
        return {
            total: candidates.length,
            byStatus: {
                pending: candidates.filter(c => c.status === 'pending').length,
                reviewed: candidates.filter(c => c.status === 'reviewed').length,
                accepted: candidates.filter(c => c.status === 'accepted').length,
                rejected: candidates.filter(c => c.status === 'rejected').length,
                withdrawn: candidates.filter(c => c.status === 'withdrawn').length
            },
            byAffinity: {
                'muy alto': candidates.filter(c => c.affinity.level === 'muy alto').length,
                'alto': candidates.filter(c => c.affinity.level === 'alto').length,
                'medio': candidates.filter(c => c.affinity.level === 'medio').length,
                'bajo': candidates.filter(c => c.affinity.level === 'bajo').length,
                'sin datos': candidates.filter(c => c.affinity.level === 'sin datos').length
            }
        };
    }

    /**
     * Parsear skills de oferta desde string de tags
     * @param {string} tagString - String con tags separados por comas
     * @returns {Object} Objeto con skills y sus pesos
     */
    // ELIMINADO: función con lógica hardcodeada de tags
    // _parseOfferSkills() - reemplazado por sistema profesional de Skills/OfferSkill

    /**
     * Parsear skills de estudiante desde string de tags
     * @param {string} tagString - String con tags separados por comas
     * @returns {Object} Objeto con skills y sus niveles
     */
    _parseStudentSkills(tagString) {
        if (!tagString || typeof tagString !== 'string') {
            return {};
        }
        
        const skills = {};
        const tags = tagString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .slice(0, 30); // Limitar a 30 skills máximo
        
        tags.forEach(tag => {
            if (tag.length >= 2) { // Mínimo 2 caracteres
                // Nivel aleatorio entre 1-3 por ahora (en el futuro será real)
                skills[tag.toLowerCase()] = Math.floor(Math.random() * 3) + 1;
            }
        });
        
        return skills;
    }

    /**
     * Validar que una aplicación pertenece a la empresa
     * @param {number} applicationId - ID de la aplicación
     * @param {number} userId - ID del usuario de la empresa
     * @returns {Promise<Object>} Aplicación y empresa validadas
     */
    async validateApplicationOwnership(applicationId, userId) {
        const operationId = `validateApp_${applicationId}_${userId}_${Date.now()}`;
        
        try {
            logger.debug({ applicationId, userId, operationId }, 'Validating application ownership');
            
            const company = await this.getCompanyByUserId(userId);
            
            const application = await Application.findOne({
                where: { 
                    id: applicationId,
                    companyId: company.id 
                },
                include: [
                    {
                        model: Offer,
                        where: { companyId: company.id },
                        include: [{
                            model: Company,
                            attributes: ['id', 'name']
                        }]
                    },
                    {
                        model: Student,
                        include: [{
                            model: User,
                            attributes: ['id', 'name', 'surname', 'email']
                        }]
                    }
                ]
            });

            if (!application) {
                logger.warn({ 
                    applicationId, 
                    userId, 
                    companyId: company.id,
                    operationId 
                }, 'Application not found or access denied');
                throw new Error('Aplicación no encontrada o no pertenece a tu empresa');
            }

            logger.info({ 
                applicationId, 
                userId, 
                companyId: company.id,
                operationId 
            }, 'Application ownership validated successfully');

            return { application, company };
            
        } catch (error) {
            logger.error({ 
                applicationId, 
                userId, 
                operationId,
                error: error.message 
            }, 'Error validating application ownership');
            throw error;
        }
    }

    /**
     * Marcar CV como revisado
     * @param {number} applicationId - ID de la aplicación
     * @param {number} userId - ID del usuario de la empresa
     * @returns {Promise<Object>} Aplicación actualizada
     */
    async markCVAsReviewed(applicationId, userId) {
        const operationId = `markReviewed_${applicationId}_${userId}_${Date.now()}`;
        
        try {
            logger.info({ applicationId, userId, operationId }, 'Marking CV as reviewed');
            
            const { application, company } = await this.validateApplicationOwnership(applicationId, userId);

            if (application.reviewedAt) {
                logger.debug({ 
                    applicationId, 
                    userId, 
                    companyId: company.id,
                    reviewedAt: application.reviewedAt,
                    operationId 
                }, 'CV already marked as reviewed');
                return application;
            }

            const updatedApplication = await application.update({
                reviewedAt: new Date(),
                status: application.status === 'pending' ? 'reviewed' : application.status
            });

            logger.info({ 
                applicationId, 
                userId, 
                companyId: company.id,
                previousStatus: application.status,
                newStatus: updatedApplication.status,
                reviewedAt: updatedApplication.reviewedAt,
                operationId
            }, 'CV marked as reviewed successfully');

            return updatedApplication;
            
        } catch (error) {
            logger.error({ 
                applicationId, 
                userId, 
                operationId,
                error: error.message 
            }, 'Error marking CV as reviewed');
            throw error;
        }
    }

    /**
     * Obtener estadísticas generales de la empresa
     * @param {number} userId - ID del usuario de la empresa
     * @returns {Promise<Object>} Estadísticas de la empresa
     */
    async getCompanyStats(userId) {
        const operationId = `getStats_${userId}_${Date.now()}`;
        
        try {
            logger.info({ userId, operationId }, 'Getting company statistics');
            
            const company = await this.getCompanyByUserId(userId);
            
            const [offersCount, applicationsCount, activeOffers] = await Promise.all([
                Offer.count({ where: { companyId: company.id } }),
                Application.count({ where: { companyId: company.id } }),
                Offer.count({ 
                    where: { 
                        companyId: company.id,
                        // Agregar condición de activo cuando se implemente
                    } 
                })
            ]);

            const stats = {
                company: {
                    id: company.id,
                    name: company.name,
                    sector: company.sector
                },
                offers: {
                    total: offersCount,
                    active: activeOffers
                },
                applications: {
                    total: applicationsCount
                },
                generatedAt: new Date().toISOString()
            };

            logger.info({ 
                userId, 
                companyId: company.id,
                stats,
                operationId 
            }, 'Company statistics generated successfully');

            return stats;
            
        } catch (error) {
            logger.error({ 
                userId, 
                operationId,
                error: error.message 
            }, 'Error getting company statistics');
            throw error;
        }
    }

    /**
     * Obtener empresas asociadas a un usuario (soporta múltiples)
     */
    async getCompaniesByUserId(userId) {
        try {
            const userCompanies = await UserCompany.findAll({
                where: { 
                    userId,
                    isActive: true 
                },
                include: [{
                    model: Company,
                    as: 'company' // 🔥 AGREGAR EL ALIAS
                }]
            });

            if (userCompanies.length === 0) {
                throw new Error(`No se encontraron empresas para el usuario ${userId}`);
            }

            return userCompanies.map(uc => ({
                ...uc.company.toJSON(), // 🔥 USAR EL ALIAS
                userRole: uc.role,
                assignedAt: uc.assignedAt
            }));
        } catch (error) {
            logger.error(`Error obteniendo empresas para usuario ${userId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener empresa principal de un usuario (primera empresa o la marcada como principal)
     */
    async getPrimaryCompanyByUserId(userId) {
        const companies = await this.getCompaniesByUserId(userId);
        return companies[0]; // Por ahora, la primera empresa
    }

    /**
     * Verificar si un usuario tiene acceso a una empresa específica
     */
    async verifyUserCompanyAccess(userId, companyId, requiredRole = null) {
        try {
            const userCompany = await UserCompany.findOne({
                where: { 
                    userId,
                    companyId,
                    isActive: true,
                    ...(requiredRole && { role: requiredRole })
                }
            });

            return !!userCompany;
        } catch (error) {
            logger.error(`Error verificando acceso empresa: ${error.message}`);
            return false;
        }
    }

    /**
     * Agregar usuario a empresa
     */
    async addUserToCompany(userId, companyId, role = 'admin') {
        try {
            const userCompany = await UserCompany.create({
                userId,
                companyId,
                role,
                isActive: true
            });

            logger.info(`Usuario ${userId} agregado a empresa ${companyId} con rol ${role}`);
            return userCompany;
        } catch (error) {
            logger.error(`Error agregando usuario a empresa: ${error.message}`);
            throw error;
        }
    }
}

export default new CompanyService();