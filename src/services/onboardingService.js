import { Student, User, Cv, Application, Offer, Profamily, Company } from '../models/relations.js';
import { AffinityCalculator } from './affinityCalculator.js';
import logger from '../logs/logger.js';
import { Op } from 'sequelize';

export class OnboardingService {
    constructor() {
        this.affinityCalculator = new AffinityCalculator();
        logger.info('OnboardingService initialized');
    }

    /**
     * Verificar estado completo del onboarding del usuario
     */
    async checkOnboardingStatus(userId, role) {
        try {
            logger.info({ userId, role }, 'Checking onboarding status');

            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const status = {
                userId,
                role,
                user: {
                    hasBasicInfo: this._hasBasicUserInfo(user),
                    hasPhone: !!user.phone,
                    hasProfileComplete: this._isUserProfileComplete(user)
                },
                currentStep: 'complete',
                nextSteps: [],
                isComplete: false,
                recommendations: []
            };

            // Verificar específico por rol
            switch (role) {
                case 'student':
                    await this._checkStudentOnboarding(userId, status);
                    break;
                case 'company':
                    await this._checkCompanyOnboarding(userId, status);
                    break;
                case 'scenter':
                    await this._checkCenterOnboarding(userId, status);
                    break;
                default:
                    status.currentStep = 'complete';
                    status.isComplete = true;
            }

            logger.info({ 
                userId, 
                role, 
                currentStep: status.currentStep,
                isComplete: status.isComplete,
                nextStepsCount: status.nextSteps.length 
            }, 'Onboarding status checked');

            return status;

        } catch (error) {
            logger.error({ userId, role, error: error.message }, 'Error checking onboarding status');
            throw error;
        }
    }

    /**
     * Verificar onboarding específico para estudiantes
     */
    async _checkStudentOnboarding(userId, status) {
        try {
            // 1. Verificar si existe perfil de estudiante
            const student = await Student.findOne({
                where: { userId },
                include: [
                    { model: User, as: 'user' },
                    { model: Profamily, as: 'profamily' },
                    { model: Cv, required: false }
                ]
            });

            if (!student) {
                status.currentStep = 'create_profile';
                status.nextSteps.push({
                    step: 'create_profile',
                    title: 'Completar perfil de estudiante',
                    description: 'Necesitas completar tu información académica y profesional',
                    action: 'redirect',
                    url: '/auth/complete-profile/student',
                    priority: 'high'
                });
                return;
            }

            // 2. Verificar información básica del estudiante
            const hasStudentInfo = this._hasStudentBasicInfo(student);
            if (!hasStudentInfo) {
                status.currentStep = 'complete_student_info';
                status.nextSteps.push({
                    step: 'complete_student_info',
                    title: 'Completar información académica',
                    description: 'Faltan datos importantes en tu perfil académico',
                    action: 'redirect',
                    url: '/auth/complete-profile/student',
                    priority: 'high'
                });
                return;
            }

            // 3. Verificar CV
            const cv = student.Cv || await Cv.findOne({ where: { studentId: student.id } });
            if (!cv) {
                status.currentStep = 'create_cv';
                status.nextSteps.push({
                    step: 'create_cv',
                    title: 'Crear tu CV',
                    description: 'Un CV completo aumenta tus posibilidades de ser seleccionado',
                    action: 'redirect',
                    url: '/mi-cv',
                    priority: 'high'
                });
                return;
            }

            // 4. Verificar CV completo
            const isCvComplete = this._isCvComplete(cv);
            if (!isCvComplete) {
                status.currentStep = 'complete_cv';
                status.nextSteps.push({
                    step: 'complete_cv',
                    title: 'Completar tu CV',
                    description: 'Tu CV necesita más información para destacar',
                    action: 'redirect',
                    url: '/mi-cv',
                    priority: 'medium',
                    details: {
                        missingFields: this._getMissingCvFields(cv)
                    }
                });
                return;
            }

            // 5. Verificar aplicaciones a ofertas
            const applications = await Application.findAll({
                where: { studentId: student.id },
                include: [{ model: Offer }]
            });

            if (applications.length === 0) {
                status.currentStep = 'apply_to_offers';
                
                // Obtener ofertas recomendadas
                const recommendedOffers = await this._getRecommendedOffers(student);
                
                status.nextSteps.push({
                    step: 'apply_to_offers',
                    title: 'Aplicar a ofertas',
                    description: `Encontramos ${recommendedOffers.length} ofertas perfectas para ti`,
                    action: 'redirect',
                    url: '/ofertas',
                    priority: 'medium',
                    details: {
                        recommendedOffersCount: recommendedOffers.length,
                        topOffers: recommendedOffers.slice(0, 3)
                    }
                });

                status.recommendations = recommendedOffers;
                return;
            }

            // 6. Todo completo - mostrar estado actual
            status.currentStep = 'complete';
            status.isComplete = true;
            status.nextSteps.push({
                step: 'dashboard',
                title: '¡Perfil completo!',
                description: `Has aplicado a ${applications.length} ofertas. Revisa tu estado en el dashboard`,
                action: 'redirect',
                url: '/dashboard',
                priority: 'low'
            });

        } catch (error) {
            logger.error({ userId, error: error.message }, 'Error checking student onboarding');
            throw error;
        }
    }

    /**
     * Verificar onboarding para empresas
     */
    async _checkCompanyOnboarding(userId, status) {
        try {
            // Verificar si existe perfil de empresa
            const company = await Company.findOne({
                where: { userId }
            });

            if (!company) {
                status.currentStep = 'create_profile';
                status.nextSteps.push({
                    step: 'create_profile',
                    title: 'Completar perfil de empresa',
                    description: 'Necesitas completar tu información empresarial',
                    action: 'redirect',
                    url: '/auth/complete-profile/company',
                    priority: 'high'
                });
                return;
            }

            // Verificar información básica de la empresa
            const hasCompanyInfo = this._hasCompanyBasicInfo(company);
            if (!hasCompanyInfo) {
                status.currentStep = 'complete_company_info';
                status.nextSteps.push({
                    step: 'complete_company_info',
                    title: 'Completar información empresarial',
                    description: 'Faltan datos importantes de tu empresa',
                    action: 'redirect',
                    url: '/auth/complete-profile/company',
                    priority: 'high'
                });
                return;
            }

            // Verificar ofertas publicadas
            const offers = await Offer.findAll({
                where: { companyId: company.id }
            });

            if (offers.length === 0) {
                status.currentStep = 'create_first_offer';
                status.nextSteps.push({
                    step: 'create_first_offer',
                    title: 'Crear tu primera oferta',
                    description: 'Publica una oferta para empezar a recibir candidatos',
                    action: 'redirect',
                    url: '/empresa/ofertas',
                    priority: 'medium'
                });
                return;
            }

            // Todo completo
            status.currentStep = 'complete';
            status.isComplete = true;

        } catch (error) {
            logger.error({ userId, error: error.message }, 'Error checking company onboarding');
            throw error;
        }
    }

    /**
     * Verificar onboarding para centros de estudios
     */
    async _checkCenterOnboarding(userId, status) {
        // Similar lógica para centros de estudios
        status.currentStep = 'complete';
        status.isComplete = true;
    }

    /**
     * Obtener ofertas recomendadas para un estudiante
     */
    async _getRecommendedOffers(student) {
        try {
            const offers = await Offer.findAll({
                where: {
                    // Solo ofertas de la misma familia profesional o ofertas generales
                    ...(student.profamilyId && { profamilyId: [student.profamilyId, null] })
                },
                include: [
                    { model: Profamily, as: 'profamily', required: false },
                    { model: Company }
                ],
                order: [['createdAt', 'DESC']],
                limit: 20
            });

            // Filtrar por modalidad y ubicación
            const filteredOffers = offers.filter(offer => {
                // Ofertas remotas: disponibles para todos
                if (offer.mode === 'remoto') return true;
                
                // Ofertas presenciales: solo del mismo país
                if (offer.mode === 'presencial') {
                    return true; // Por ahora mostrar todas
                }
                
                return true;
            });

            // Calcular afinidad si el estudiante tiene skills
            // ELIMINADO: lógica de tags hardcodeados reemplazada por sistema profesional
            // Las skills ahora vienen de StudentSkill y OfferSkill tables
            if (student.Skills && student.Skills.length > 0) {
                
                return filteredOffers.map(offer => {
                    // Usar skills profesionales de las relaciones, no tags hardcodeados
                    const affinity = { score: 0, level: 'bajo' }; // Placeholder - implementar con Skills reales
                    
                    return {
                        ...offer.toJSON(),
                        affinity,
                        recommended: affinity.level === 'muy alto' || affinity.level === 'alto'
                    };
                }).sort((a, b) => b.affinity.score - a.affinity.score);
            }

            return filteredOffers.map(offer => ({
                ...offer.toJSON(),
                affinity: { level: 'sin datos', score: 0 },
                recommended: true
            }));

        } catch (error) {
            logger.error({ studentId: student.id, error: error.message }, 'Error getting recommended offers');
            return [];
        }
    }

    /**
     * Validaciones de información básica
     */
    _hasBasicUserInfo(user) {
        return !!(user.name && user.email);
    }

    _isUserProfileComplete(user) {
        return !!(user.name && user.email && user.phone);
    }

    _hasStudentBasicInfo(student) {
        return !!(student.disp && student.description);
    }

    _hasCompanyBasicInfo(company) {
        return !!(company.name && company.city && company.sector);
    }

    _isCvComplete(cv) {
        return !!(cv.name && cv.email && cv.phone && cv.file);
    }

    _getMissingCvFields(cv) {
        const fields = [];
        if (!cv.name) fields.push('Nombre completo');
        if (!cv.email) fields.push('Email de contacto');
        if (!cv.phone) fields.push('Teléfono');
        if (!cv.file) fields.push('Archivo CV (PDF)');
        return fields;
    }

    /**
     * Helpers para parsear skills
     */
    _parseStudentSkills(tagString) {
        if (!tagString) return {};
        const skills = {};
        tagString.split(',').forEach(tag => {
            const cleanTag = tag.trim().toLowerCase();
            if (cleanTag) skills[cleanTag] = Math.floor(Math.random() * 3) + 1;
        });
        return skills;
    }

    _parseOfferSkills(tagString) {
        if (!tagString) return {};
        const skills = {};
        tagString.split(',').forEach(tag => {
            const cleanTag = tag.trim().toLowerCase();
            if (cleanTag) skills[cleanTag] = 3;
        });
        return skills;
    }

    /**
     * Marcar paso como completado
     */
    async markStepCompleted(userId, step) {
        try {
            logger.info({ userId, step }, 'Marking onboarding step as completed');
            
            // Por ahora solo loggeamos, puedes agregar BD si necesitas tracking
            return { success: true, step, completedAt: new Date() };
            
        } catch (error) {
            logger.error({ userId, step, error: error.message }, 'Error marking step as completed');
            throw error;
        }
    }
}

export default new OnboardingService();