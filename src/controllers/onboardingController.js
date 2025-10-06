// ASEGÚRATE DE QUE ESTAS IMPORTACIONES SEAN CORRECTAS
import { User, Student, Application, Offer, Cv, Company, Profamily, Skill } from '../models/relations.js';
import logger from '../logs/logger.js';
import { Op } from 'sequelize';
import affinityCalculator from '../services/affinityCalculator.js';

// AGREGA UN TEST AL INICIO DEL ARCHIVO
console.log('🔍 Testing model imports:');
console.log('  User:', typeof User);
console.log('  Student:', typeof Student);
console.log('  Application:', typeof Application);
console.log('  Offer:', typeof Offer);
console.log('  Cv:', typeof Cv);

/**
 * Verificar onboarding específico para estudiantes
 */
const checkStudentOnboarding = async (userId, status) => {
    try {
        // 1. Verificar si existe perfil de estudiante
        const student = await Student.findOne({
            where: { userId }
        });

        // 2. BUSCAR APLICACIONES A TRAVÉS DEL STUDENT (si existe)
        let applications = [];
        
        if (student) {
            applications = await Application.findAll({
                where: { studentId: student.id }, // ← USAR studentId correcto
                include: [{ 
                    model: Offer,
                    as: 'offer',
                    required: false 
                }]
            });
        } else {
            // Si no hay student, buscar si hay aplicaciones orfanas
            // (esto no debería pasar normalmente, pero por si acaso)
            console.log('No student profile found, checking for orphaned applications...');
        }

        console.log(`📝 Found ${applications.length} applications for user ${userId}`);

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

            // NOTA: Sin student, no puede haber aplicaciones válidas
            return;
        }

        // 3. Verificar información básica del estudiante
        const hasStudentInfo = !!(student.grade && student.course && student.disp);
        
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

            // AGREGAR: Si tiene aplicaciones pero info incompleta
            if (applications.length > 0) {
                status.nextSteps[0].description = `Tienes ${applications.length} aplicaciones. Completa tu información académica para mejorar tu perfil.`;
            }
            return;
        }

        // 4. Verificar CV
        const cv = await Cv.findOne({ where: { studentId: student.id } });
        
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

            // AGREGAR: Si tiene aplicaciones pero no CV
            if (applications.length > 0) {
                status.nextSteps[0].description = `Tienes ${applications.length} aplicaciones activas. Crear tu CV aumentará significativamente tus posibilidades.`;
                status.currentStep = 'create_cv_with_applications';
            }
            return;
        }

        // 5. Verificar aplicaciones (MOVER AL FINAL)
        if (applications.length === 0) {
            status.currentStep = 'apply_to_offers';
            
            // Obtener ofertas disponibles
            const availableOffers = await Offer.findAll({
                limit: 10,
                order: [['createdAt', 'DESC']]
            });
            
            status.nextSteps.push({
                step: 'apply_to_offers',
                title: 'Aplicar a ofertas',
                description: `Encontramos ${availableOffers.length} ofertas disponibles para ti`,
                action: 'redirect',
                url: '/ofertas',
                priority: 'medium',
                details: {
                    recommendedOffersCount: availableOffers.length,
                    topOffers: availableOffers.slice(0, 3)
                }
            });

            status.recommendations = availableOffers;
            return;
        }

        // 6. Todo completo
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

        // AGREGAR: información adicional sobre las aplicaciones
        status.applicationsInfo = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'pending').length,
            accepted: applications.filter(app => app.status === 'accepted').length,
            rejected: applications.filter(app => app.status === 'rejected').length
        };

    } catch (error) {
        console.error('❌ Error in checkStudentOnboarding:', error);
        throw error;
    }
};

/**
 * Verificar onboarding para empresas
 */
const checkCompanyOnboarding = async (userId, status) => {
    status.currentStep = 'complete';
    status.isComplete = true;
};

/**
 * Verificar estado del onboarding
 */
const checkStatus = async (req, res) => {
    console.log('🚀 === checkStatus CALLED ===');
    console.log('📊 req.user:', req.user);
    
    try {
        const { userId, role } = req.user;
        
        console.log(`🔍 Checking onboarding for user ${userId} with role ${role}`);

        // AGREGAR TRY-CATCH ESPECÍFICO PARA LA CONSULTA DE USER
        let user;
        try {
            console.log('🔍 Finding user by PK...');
            user = await User.findByPk(userId);
            console.log('✅ User found:', !!user);
        } catch (userError) {
            console.error('❌ Error finding user:', userError);
            throw new Error(`Error finding user: ${userError.message}`);
        }

        if (!user) {
            console.log('❌ User not found in database');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('📝 Creating status object...');
        const status = {
            userId,
            role,
            user: {
                hasBasicInfo: !!(user.name && user.email),
                hasPhone: !!user.phone,
                hasProfileComplete: !!(user.name && user.email && user.phone)
            },
            currentStep: 'complete',
            nextSteps: [],
            isComplete: false,
            recommendations: []
        };

        console.log('📝 Status object created successfully');

        // AGREGAR TRY-CATCH ESPECÍFICO PARA CADA ROLE
        try {
            console.log(`🔍 Checking role-specific onboarding for role: ${role}`);
            
            if (role === 'student') {
                console.log('🎓 Calling checkStudentOnboarding...');
                await checkStudentOnboarding(userId, status);
                console.log('✅ checkStudentOnboarding completed');
            } else if (role === 'company') {
                console.log('🏢 Calling checkCompanyOnboarding...');
                await checkCompanyOnboarding(userId, status);
                console.log('✅ checkCompanyOnboarding completed');
            } else {
                console.log(`ℹ️ Unknown role ${role}, setting as complete`);
                status.currentStep = 'complete';
                status.isComplete = true;
            }
        } catch (roleError) {
            console.error(`❌ Error in role-specific check (${role}):`, roleError);
            throw new Error(`Error in ${role} onboarding check: ${roleError.message}`);
        }

        console.log(`🎯 Final status - Step: ${status.currentStep}, Complete: ${status.isComplete}`);

        res.json({
            success: true,
            data: status
        });
        
        console.log('✅ Response sent successfully');
        
    } catch (error) {
        console.error('❌ FATAL ERROR in checkStatus:', error);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error al verificar estado del onboarding',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Obtener siguiente paso del onboarding
 */
const getNextStep = async (req, res) => {
    try {
        const { userId, role } = req.user;
        
        const mockRes = {
            json: (data) => data,
            status: () => mockRes
        };
        
        const statusResult = await checkStatus(req, mockRes);
        const status = statusResult.data;
        
        if (status.isComplete) {
            return res.json({
                success: true,
                data: {
                    hasNextStep: false,
                    message: 'Onboarding completado',
                    currentStep: 'complete'
                }
            });
        }

        const nextStep = status.nextSteps[0];
        
        res.json({
            success: true,
            data: {
                hasNextStep: true,
                nextStep,
                totalSteps: status.nextSteps.length,
                currentStep: status.currentStep
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener siguiente paso',
            error: error.message
        });
    }
};

/**
 * Marcar paso como completado
 */
const completeStep = async (req, res) => {
    try {
        const { userId } = req.user;
        const { step } = req.body;
        
        if (!step) {
            return res.status(400).json({
                success: false,
                message: 'Step es requerido'
            });
        }
        
        const result = { 
            success: true, 
            step, 
            completedAt: new Date() 
        };
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al completar paso',
            error: error.message
        });
    }
};

/**
 * Obtener ofertas recomendadas para estudiante
 */
const getRecommendedOffers = async (req, res) => {
    try {
        const { userId, role } = req.user;
        
        if (role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Solo disponible para estudiantes'
            });
        }

        // Obtener perfil del estudiante
        const student = await Student.findOne({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'surname', 'email']
                },
                {
                    model: Cv,
                    as: 'cv',
                    include: [
                        {
                            model: Skill,
                            as: 'skills',
                            attributes: ['id', 'name', 'category'],
                            through: { attributes: ['proficiencyLevel'] }
                        }
                    ]
                }
            ]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Perfil de estudiante no encontrado'
            });
        }

        console.log('Student found:', student.id);
        console.log('Student CV:', student.cv ? 'exists' : 'null');
        console.log('Student CV skills:', student.cv?.skills ? student.cv.skills.length : 'no skills');

        // Preparar skills del estudiante desde el CV
        const studentSkills = {};
        if (student.cv && student.cv.skills && student.cv.skills.length > 0) {
            student.cv.skills.forEach(cvSkill => {
                const levelMap = {
                    "bajo": 1,
                    "medio": 2,
                    "alto": 3
                };
                console.log('Processing skill:', cvSkill.name, 'CvSkill data:', cvSkill.CvSkill);
                studentSkills[cvSkill.name.toLowerCase()] = levelMap[cvSkill.CvSkill?.proficiencyLevel] || 1;
            });
        }

        console.log('Student skills processed:', Object.keys(studentSkills).length);

        // Obtener todas las ofertas activas
        const offers = await Offer.findAll({
            where: { active: true },
            include: [
                {
                    model: Company,
                    attributes: ['name', 'sector']
                },
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: Skill,
                    as: 'skills',
                    attributes: ['id', 'name', 'category'],
                    through: { attributes: [] }
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50 // Limitar para performance
        });

        console.log('Offers found:', offers.length);

        // Usar affinity calculator para calcular recomendaciones
        // const affinityCalculator = (await import('../services/affinityCalculator.js')).default;
        
        const offersWithAffinity = offers.map(offer => {
            // Convertir skills de la oferta al formato esperado
            const offerSkills = {};
            if (offer.skills && offer.skills.length > 0) {
                offer.skills.forEach(skill => {
                    offerSkills[skill.name.toLowerCase()] = 2; // Nivel por defecto para skills de oferta
                });
            }
            
            const affinity = affinityCalculator.calculateAffinity(
                offerSkills,
                studentSkills,
                {
                    profamilyId: student.profamilyId,
                    offerProfamilyIds: offer.profamilys ? offer.profamilys.map(p => p.id) : []
                }
            );

            return {
                ...offer.toJSON(),
                affinity,
                recommended: affinity.score >= 4.0 // Recomendar si score >= 4.0
            };
        });

        // Ordenar por score de afinidad descendente
        offersWithAffinity.sort((a, b) => b.affinity.score - a.affinity.score);

        // Tomar las mejores 10 recomendaciones
        const recommendedOffers = offersWithAffinity.slice(0, 10);
        
        res.json({
            success: true,
            data: {
                offers: recommendedOffers,
                total: recommendedOffers.length,
                studentInfo: {
                    name: student.user.name,
                    profamily: student.profamilyId,
                    skillsCount: Object.keys(studentSkills).length
                }
            }
        });
        
    } catch (error) {
        console.error('Error getRecommendedOffers:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener ofertas recomendadas',
            error: error.message
        });
    }
};

// Exportar como objeto con las funciones
export default {
    checkStatus,
    getNextStep,
    completeStep,
    getRecommendedOffers
};