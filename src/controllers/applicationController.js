import { Application } from '../models/application.js';
import { Offer } from '../models/offer.js';
import { Student } from '../models/student.js';
import { Company } from '../models/company.js';
import { Profamily } from '../models/profamily.js';
import { Cv } from '../models/cv.js';
import { User } from '../models/users.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js';
import { StudentToken } from '../models/studentToken.js';
import affinityCalculator from '../services/affinityCalculator.js';
import companyService from '../services/companyService.js';
import notificationService from '../services/notificationService.js';
import meetingService from '../services/meetingService.js';
import { UserCompany } from '../models/relations.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la aplicación
 *         offerId:
 *           type: integer
 *           description: ID de la oferta
 *         studentId:
 *           type: integer
 *           description: ID del estudiante
 *         companyId:
 *           type: integer
 *           description: ID de la empresa
 *         status:
 *           type: string
 *           enum: [pending, reviewed, accepted, rejected, withdrawn]
 *           description: Estado de la aplicación
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de aplicación
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de revisión
 *         message:
 *           type: string
 *           description: Mensaje del estudiante
 *         companyNotes:
 *           type: string
 *           description: Notas de la empresa
 *         rejectionReason:
 *           type: string
 *           description: Razón del rechazo
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Aplicar a una oferta
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offerId
 *             properties:
 *               offerId:
 *                 type: integer
 *                 description: ID de la oferta a la que aplicar
 *               message:
 *                 type: string
 *                 description: Mensaje opcional del estudiante
 *     responses:
 *       201:
 *         description: Aplicación creada exitosamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Ya has aplicado a esta oferta
 *       500:
 *         description: Error interno del servidor
 */
async function applyToOffer(req, res) {
    const { userId } = req.user;
    const { offerId, message } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            // Buscar el estudiante con información del usuario
            const student = await Student.findOne({
                where: { userId },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['name', 'surname', 'email']
                }],
                transaction: t
            });

            if (!student) {
                return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
            }

            // Buscar la oferta y la empresa asociada
            const offer = await Offer.findByPk(offerId, {
                include: [{
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
                }],
                transaction: t
            });

            if (!offer) {
                return res.status(404).json({ mensaje: 'Oferta no encontrada' });
            }

            console.log('Offer found:', offer.id, offer.name);
            console.log('Company associated:', offer.company ? offer.company.id : 'null/undefined');

            if (!offer.company) {
                return res.status(400).json({ mensaje: 'La oferta no tiene empresa asociada' });
            }

            const company = offer.company;

            // Verificar si ya aplicó a esta oferta
            const existingApplication = await Application.findOne({
                where: {
                    offerId,
                    studentId: student.id
                },
                transaction: t
            });

            if (existingApplication) {
                return res.status(409).json({ mensaje: 'Ya has aplicado a esta oferta' });
            }

            // Crear la aplicación
            const application = await Application.create({
                offerId,
                studentId: student.id,
                companyId: company.id,
                message: message || null,
                status: 'pending'
            }, { transaction: t });

            // 🚀 ENVIAR NOTIFICACIÓN A LA EMPRESA (Simplificado temporalmente)
            try {
                await notificationService.sendNotificationToUser(company.id, {
                    title: 'Nueva aplicación recibida',
                    message: `${student.user.name} se ha postulado a la oferta "${offer.name}"`,
                    type: 'new_application',
                    priority: 'medium',
                    metadata: {
                        applicationId: application.id,
                        studentName: student.user.name,
                        offerName: offer.name
                    }
                });
            } catch (notificationError) {
                console.log('⚠️ Error sending notification (not critical):', notificationError.message);
                // No fallar la aplicación por error de notificación
            }

            logger.info({ userId, applicationId: application.id }, "Application created with notification sent");
            res.status(201).json({
                mensaje: 'Aplicación enviada exitosamente',
                application: {
                    id: application.id,
                    status: application.status,
                    appliedAt: application.appliedAt,
                    offer: {
                        id: offer.id,
                        name: offer.name,
                        location: offer.location,
                        type: offer.type
                    }
                }
            });
        });
    } catch (error) {
        logger.error('Error applyToOffer: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/user/{userId}:
 *   get:
 *     summary: Obtener aplicaciones de un usuario
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de aplicaciones del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.user; // Del middleware de autenticación
    console.log(`📋 Fetching applications for user: ${userId}`);

    // 🔥 PASO 1: Encontrar el Student asociado al User
    const student = await Student.findOne({
      where: { userId: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!student) {
      console.log(`❌ No student profile found for user ${userId}`);
      return res.json({
        success: true,
        applications: [],
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        reviewed: 0
      });
    }

    console.log(`👤 Student found: ${student.id} for user ${userId}`);

    // 🔥 PASO 2: Buscar aplicaciones del studentId (no userId)
    const applications = await Application.findAll({
      where: { studentId: student.id },
      include: [
        {
          model: Offer,
          as: 'offer', // Usar el alias correcto de relations.js
          attributes: ['id', 'name', 'location', 'sector', 'type', 'description', 'jobs', 'requisites'],
          include: [
            {
              model: Company,
              attributes: ['id', 'name', 'sector', 'city']
            }
          ]
        }
      ],
      order: [['appliedAt', 'DESC']]
    });

    console.log(`📋 Found ${applications.length} applications for student ${student.id}`);

    // 🔥 PASO 3: Formatear para el frontend
    const formattedApplications = applications.map(app => ({
      id: app.id,
      status: app.status || 'pending',
      appliedAt: app.appliedAt,
      reviewedAt: app.reviewedAt,
      cvViewed: app.cvViewed || false,
      cvViewedAt: app.cvViewedAt,
      message: app.message,
      companyNotes: app.companyNotes,
      rejectionReason: app.rejectionReason,
      interviewDetails: app.interviewDetails ? (() => {
        try {
          return JSON.parse(app.interviewDetails);
        } catch (error) {
          console.error('Error parsing interviewDetails for app', app.id, ':', error);
          console.error('Raw interviewDetails:', app.interviewDetails);
          return null;
        }
      })() : null,
      interviewRequestedAt: app.interviewRequestedAt,
      offer: app.offer ? {
        id: app.offer.id,
        name: app.offer.name,
        location: app.offer.location,
        sector: app.offer.sector,
        type: app.offer.type,
        description: app.offer.description,
        jobs: app.offer.jobs,
        requisites: app.offer.requisites,
        company: app.offer.company ? {
          id: app.offer.company.id,
          name: app.offer.company.name,
          sector: app.offer.company.sector,
          city: app.offer.company.city
        } : null
      } : null
    }));

    // Debug the first application
    if (formattedApplications.length > 0) {
      console.log('🔍 Raw interviewDetails from DB:', applications[0].interviewDetails);
      console.log('🔍 Parsed interviewDetails:', formattedApplications[0].interviewDetails);
      console.log('🔍 Application status:', formattedApplications[0].status);
    }

    // 🔥 PASO 4: Calcular estadísticas
    const stats = {
      total: formattedApplications.length,
      pending: formattedApplications.filter(app => app.status === 'pending' || !app.status).length,
      accepted: formattedApplications.filter(app => app.status === 'accepted').length,
      rejected: formattedApplications.filter(app => app.status === 'rejected').length,
      reviewed: formattedApplications.filter(app => app.status === 'reviewed').length,
    };

    console.log(`📊 Application stats:`, stats);

    // 🔥 RESPUESTA COMPATIBLE CON EL FRONTEND
    res.json({
      success: true,
      applications: formattedApplications,
      ...stats
    });

  } catch (error) {
    console.error('❌ Error getUserApplications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener aplicaciones del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/applications/offer/{offerId}:
 *   get:
 *     summary: Obtener aplicaciones de una oferta (para empresas)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la oferta
 *     responses:
 *       200:
 *         description: Lista de aplicaciones de la oferta
 *       403:
 *         description: No tienes permisos para ver estas aplicaciones
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function getOfferApplications(req, res) {
    const { userId } = req.user;
    const { offerId } = req.params;

    try {
        // 🔥 REEMPLAZAR EL MAPEO MANUAL CON EL SERVICE
        const company = await companyService.getCompanyByUserId(userId);

        // Verificar que la oferta pertenece a la empresa del usuario
        const offer = await Offer.findOne({
            where: { 
                id: offerId,
                companyId: company.id // 🔥 USAR company.id del service
            }
        });

        if (!offer) {
            return res.status(404).json({ mensaje: 'Oferta no encontrada o no tienes permisos para verla' });
        }

        // Obtener las aplicaciones de la oferta con el formato correcto
        console.log('🔍 Searching applications for offerId:', offerId);
        
        const applications = await Application.findAll({
            where: { offerId },
            attributes: ['id', 'status', 'appliedAt', 'message', 'companyNotes', 'rejectionReason', 'interviewDetails', 'interviewRequestedAt', 'interviewConfirmedAt', 'interviewRejectedAt', 'interviewRejectionReason', 'studentNotes'],
            include: [
                {
                    model: Student,
                    attributes: ['id', 'grade', 'course', 'car', 'tag'],
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
                },
                {
                    model: Offer,
                    attributes: ['id', 'name', 'location', 'type', 'mode', 'description', 'sector']
                }
            ],
            order: [['appliedAt', 'DESC']]
        });

        console.log('🔍 Found applications:', applications.length);
        
        if (applications.length > 0) {
            console.log('🔍 First application raw data:', JSON.stringify(applications[0].toJSON(), null, 2));
        }

        // Formatear la respuesta para que sea consistente con el frontend
        const formattedApplications = applications.map(app => {
            const appData = app.toJSON();
            console.log('🔍 Raw application data:', {
                id: app.id,
                student: appData.student ? 'exists' : 'missing',
                studentUser: appData.student?.user ? 'exists' : 'missing'
            });
            
            // Debug interview details specifically
            console.log(`🔍 Application ${app.id} - Status: ${appData.status}`);
            console.log(`🔍 Application ${app.id} - Raw interviewDetails:`, appData.interviewDetails);
            
            let parsedInterviewDetails = null;
            if (appData.interviewDetails) {
                try {
                    parsedInterviewDetails = JSON.parse(appData.interviewDetails);
                    console.log(`🔍 Application ${app.id} - Parsed interviewDetails:`, parsedInterviewDetails);
                } catch (parseError) {
                    console.error(`❌ Error parsing interviewDetails for application ${appData.id}:`, parseError.message);
                    console.error(`❌ Raw interviewDetails:`, appData.interviewDetails);
                    parsedInterviewDetails = null;
                }
            } else {
                console.log(`🔍 Application ${app.id} - No interviewDetails found`);
            }
            
            return {
                id: appData.id,
                status: appData.status,
                appliedAt: appData.appliedAt,
                message: appData.message,
                companyNotes: appData.companyNotes,
                rejectionReason: appData.rejectionReason,
                interviewDetails: parsedInterviewDetails,
                interviewRequestedAt: appData.interviewRequestedAt,
                interviewConfirmedAt: appData.interviewConfirmedAt,
                interviewRejectedAt: appData.interviewRejectedAt,
                interviewRejectionReason: appData.interviewRejectionReason,
                studentNotes: appData.studentNotes,
                Student: {
                    id: appData.student.id,
                    grade: appData.student.grade,
                    course: appData.student.course,
                    car: appData.student.car,
                    tag: appData.student.tag,
                    User: {
                        id: appData.student.user.id,
                        name: appData.student.user.name,
                        surname: appData.student.user.surname,
                        email: appData.student.user.email,
                        phone: appData.student.user.phone
                    },
                    profamily: appData.student.profamily ? { // 🔥 USAR profamily (minúscula)
                        id: appData.student.profamily.id,
                        name: appData.student.profamily.name,
                        description: appData.student.profamily.description
                    } : null
                },
                Offer: {
                    id: appData.offer.id,
                    name: appData.offer.name,
                    location: appData.offer.location,
                    type: appData.offer.type,
                    mode: appData.offer.mode,
                    description: appData.offer.description,
                    sector: appData.offer.sector
                }
            };
        });

        res.json(formattedApplications);
    } catch (error) {
        console.error('❌ Error getOfferApplications:', error);
        
        // 🔥 AÑADIR MANEJO DE ERROR DEL SERVICE
        if (error.message.includes('No se encontró empresa')) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }
        
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/company:
 *   get:
 *     summary: Obtener todas las aplicaciones de las ofertas de una empresa
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de aplicaciones de la empresa
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function getCompanyApplications(req, res) {
    const { userId } = req.user;
    
    try {
        // Usar el service para obtener la empresa
        const company = await companyService.getCompanyByUserId(userId);

        console.log(`🔍 Buscando aplicaciones para empresa ${company.id} (usuario ${userId})`);

        // 🔥 OBTENER APLICACIONES AGRUPADAS POR ESTUDIANTE
        const applications = await Application.findAll({
            attributes: [
                'id', 'status', 'appliedAt', 'reviewedAt', 'cvViewed', 'cvViewedAt', 
                'message', 'companyNotes', 'rejectionReason', 'interviewDetails', 
                'interviewRequestedAt', 'interviewConfirmedAt', 'interviewRejectedAt', 
                'interviewRejectionReason', 'studentNotes'
            ],
            include: [
                {
                    model: Offer,
                    as: 'offer',
                    required: true,
                    where: { companyId: company.id },
                    attributes: ['id', 'name', 'location', 'type', 'mode', 'description', 'sector']
                },
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'grade', 'course', 'car', 'tag', 'description'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'surname', 'email', 'phone']
                        },
                        {
                            model: Profamily,
                            as: 'profamily',
                            attributes: ['id', 'name', 'description'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['appliedAt', 'DESC']]
        });

        console.log(`✅ Aplicaciones encontradas: ${applications.length}`);

        // 🔥 AGRUPAR POR ESTUDIANTE
        const studentApplicationsMap = new Map();

        applications.forEach(app => {
            const studentId = app.student.id;
            
            if (!studentApplicationsMap.has(studentId)) {
                studentApplicationsMap.set(studentId, {
                    student: {
                        id: app.student.id,
                        grade: app.student.grade,
                        course: app.student.course,
                        car: app.student.car,
                        tag: app.student.tag,
                        description: app.student.description,
                        User: app.student.user,
                        profamily: app.student.profamily
                    },
                    applications: [],
                    stats: {
                        total: 0,
                        pending: 0,
                        reviewed: 0,
                        accepted: 0,
                        rejected: 0,
                        withdrawn: 0,
                        latestApplication: null,
                        firstApplication: null
                    }
                });
            }

            const studentData = studentApplicationsMap.get(studentId);
            
            // Agregar aplicación
            const applicationData = {
                id: app.id,
                status: app.status,
                appliedAt: app.appliedAt,
                reviewedAt: app.reviewedAt,
                cvViewed: app.cvViewed,
                cvViewedAt: app.cvViewedAt,
                message: app.message,
                companyNotes: app.companyNotes,
                rejectionReason: app.rejectionReason,
                interviewDetails: app.interviewDetails ? (() => {
                    try {
                        const parsed = JSON.parse(app.interviewDetails);
                        console.log(`🔍 Company App ${app.id} - Parsed interviewDetails:`, parsed);
                        return parsed;
                    } catch (parseError) {
                        console.error(`❌ Error parsing interviewDetails for company app ${app.id}:`, parseError.message);
                        console.error(`❌ Raw interviewDetails:`, app.interviewDetails);
                        return null;
                    }
                })() : null,
                interviewRequestedAt: app.interviewRequestedAt,
                interviewConfirmedAt: app.interviewConfirmedAt,
                interviewRejectedAt: app.interviewRejectedAt,
                interviewRejectionReason: app.interviewRejectionReason,
                studentNotes: app.studentNotes,
                offer: {
                    id: app.offer.id,
                    name: app.offer.name,
                    location: app.offer.location,
                    type: app.offer.type,
                    mode: app.offer.mode,
                    description: app.offer.description,
                    sector: app.offer.sector
                }
            };

            studentData.applications.push(applicationData);

            // Actualizar estadísticas
            studentData.stats.total++;
            studentData.stats[app.status]++;
            
            // Actualizar fechas de primera y última aplicación
            const currentDate = new Date(app.appliedAt);
            if (!studentData.stats.latestApplication || currentDate > new Date(studentData.stats.latestApplication)) {
                studentData.stats.latestApplication = app.appliedAt;
            }
            if (!studentData.stats.firstApplication || currentDate < new Date(studentData.stats.firstApplication)) {
                studentData.stats.firstApplication = app.appliedAt;
            }
        });

        // Convertir Map a Array y ordenar
        const groupedApplications = Array.from(studentApplicationsMap.values())
            .map(studentData => {
                // Ordenar aplicaciones del estudiante por fecha (más reciente primero)
                studentData.applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
                
                return {
                    ...studentData,
                    // Agregar información adicional
                    primaryStatus: studentData.stats.accepted > 0 ? 'accepted' :
                                 studentData.stats.rejected === studentData.stats.total ? 'rejected' :
                                 studentData.stats.reviewed > 0 ? 'reviewed' : 'pending',
                    mostRecentOffer: studentData.applications[0].offer.name,
                    totalOffers: studentData.applications.length
                };
            })
            .sort((a, b) => {
                // Ordenar por última aplicación (más reciente primero)
                return new Date(b.stats.latestApplication) - new Date(a.stats.latestApplication);
            });

        console.log(`✅ Aplicaciones agrupadas por ${groupedApplications.length} estudiantes únicos`);

        res.json({
            students: groupedApplications,
            summary: {
                totalStudents: groupedApplications.length,
                totalApplications: applications.length,
                averageApplicationsPerStudent: Math.round(applications.length / groupedApplications.length * 100) / 100
            }
        });

    } catch (error) {
        console.error('❌ Error getCompanyApplications:', error);
        
        if (error.message.includes('No se encontró empresa')) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }
        
        res.status(500).json({ 
            mensaje: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * @swagger
 * /api/applications/{applicationId}/status:
 *   put:
 *     summary: Actualizar estado de una aplicación
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la aplicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, accepted, rejected, withdrawn]
 *                 description: Nuevo estado de la aplicación
 *               companyNotes:
 *                 type: string
 *                 description: Notas de la empresa
 *               rejectionReason:
 *                 type: string
 *                 description: Razón del rechazo (si aplica)
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       403:
 *         description: No tienes permisos para actualizar esta aplicación
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function updateApplicationStatus(req, res) {
    const { userId } = req.user;
    const { applicationId } = req.params;
    const { status, companyNotes, rejectionReason } = req.body;

    const transaction = await sequelize.transaction();
    
    try {
        // 🔥 USAR EL SERVICE PARA OBTENER LA EMPRESA
        const company = await companyService.getCompanyByUserId(userId);

        // Buscar la aplicación
        const application = await Application.findByPk(applicationId, {
            include: [{
                model: Student,
                include: [{ model: User }]
            }, {
                model: Offer,
                where: { companyId: company.id }, // 🔥 VALIDAR QUE LA OFERTA PERTENECE A LA EMPRESA
                include: [{ model: Company }]
            }],
            transaction
        });

        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ mensaje: 'Aplicación no encontrada o no tienes permisos para modificarla' });
        }

        // Actualizar el estado de la aplicación actual
        await application.update({
            status,
            companyNotes,
            rejectionReason
        }, { transaction });

        // Si se acepta un estudiante, rechazar automáticamente todas sus otras aplicaciones
        if (status === 'accepted') {
            const { Op } = require('sequelize');
            
            // Buscar todas las otras aplicaciones del mismo estudiante a ofertas de esta empresa que están pendientes o en revisión
            const otherStudentApplications = await Application.findAll({
                where: {
                    studentId: application.studentId,
                    id: { [Op.ne]: applicationId }, // Excluir la aplicación actual
                    status: { [Op.in]: ['pending', 'reviewed'] } // Solo las pendientes o en revisión
                },
                include: [{
                    model: Offer,
                    where: { companyId: company.id }, // 🔥 SOLO OFERTAS DE ESTA EMPRESA
                    include: [{ model: Company }]
                }],
                transaction
            });

            // Rechazar automáticamente las otras aplicaciones del estudiante
            if (otherStudentApplications.length > 0) {
                await Application.update(
                    { 
                        status: 'rejected',
                        rejectionReason: 'Estudiante aceptado en otra empresa',
                        companyNotes: 'Aplicación rechazada automáticamente - estudiante ya aceptado'
                    },
                    {
                        where: {
                            id: { [Op.in]: otherStudentApplications.map(app => app.id) }
                        },
                        transaction
                    }
                );

                logger.info({ 
                    userId, 
                    applicationId, 
                    studentId: application.studentId,
                    rejectedApplications: otherStudentApplications.length
                }, "Student accepted - other student applications auto-rejected");
            }

            // 🔥 NUEVO: Rechazar todas las otras aplicaciones a la misma oferta
            const otherOfferApplications = await Application.findAll({
                where: {
                    offerId: application.offerId,
                    id: { [Op.ne]: applicationId }, // Excluir la aplicación actual
                    status: { [Op.in]: ['pending', 'reviewed'] } // Solo las pendientes o en revisión
                },
                include: [{
                    model: Student,
                    include: [{ model: User }]
                }],
                transaction
            });

            // Rechazar automáticamente las otras aplicaciones a la oferta
            if (otherOfferApplications.length > 0) {
                await Application.update(
                    { 
                        status: 'rejected',
                        rejectionReason: 'Oferta ya cubierta - estudiante aceptado',
                        companyNotes: 'Aplicación rechazada automáticamente - oferta ya asignada'
                    },
                    {
                        where: {
                            id: { [Op.in]: otherOfferApplications.map(app => app.id) }
                        },
                        transaction
                    }
                );

                logger.info({ 
                    userId, 
                    applicationId, 
                    offerId: application.offerId,
                    rejectedOfferApplications: otherOfferApplications.length
                }, "Offer filled - other offer applications auto-rejected");
            }

        }

        await transaction.commit();
        
        const updatedApplication = await Application.findByPk(applicationId, {
            include: [{
                model: Student,
                include: [{ model: User }]
            }, {
                model: Offer,
                include: [{ model: Company }]
            }]
        });

        // 🚀 ENVIAR NOTIFICACIÓN AL ESTUDIANTE
        const notificationType = status === 'accepted' ? 'application_accepted' : 'application_rejected';
        const notificationTitle = status === 'accepted' 
            ? '¡Felicidades! Tu aplicación fue aceptada' 
            : 'Estado de tu aplicación actualizado';
        const notificationMessage = status === 'accepted'
            ? `Has sido aceptado para la oferta "${updatedApplication.Offer.name}" en ${updatedApplication.Offer.Company.name}`
            : `Tu aplicación para "${updatedApplication.Offer.name}" ha sido ${status === 'rejected' ? 'rechazada' : 'actualizada'}`;

        await notificationService.notify(notificationType, {
            recipientId: updatedApplication.Student.id,
            recipientType: 'student',
            title: notificationTitle,
            message: notificationMessage,
            priority: status === 'accepted' ? 'high' : 'medium',
            metadata: {
                applicationId: updatedApplication.id,
                offerId: updatedApplication.Offer.id,
                companyId: updatedApplication.Offer.Company.id,
                status: status,
                offerName: updatedApplication.Offer.name,
                companyName: updatedApplication.Offer.Company.name,
                rejectionReason: rejectionReason || null
            },
            action: {
                type: 'view_application',
                url: `/estudiante/aplicaciones/${updatedApplication.id}`,
                message: status === 'accepted' ? 'Ver detalles' : 'Ver aplicación'
            }
        });

        // 🚀 NOTIFICAR OTRAS EMPRESAS SI EL ESTUDIANTE FUE ACEPTADO
        if (status === 'accepted' && otherStudentApplications.length > 0) {
            // Enviar notificaciones a las empresas cuyas aplicaciones fueron rechazadas automáticamente
            for (const otherApp of otherStudentApplications) {
                await notificationService.notify('application_rejected', {
                    recipientId: otherApp.Offer.Company.id,
                    recipientType: 'company',
                    title: 'Candidato ya no disponible',
                    message: `${updatedApplication.Student.User.name} ha sido aceptado en otra empresa y ya no está disponible`,
                    priority: 'low',
                    metadata: {
                        applicationId: otherApp.id,
                        studentId: updatedApplication.Student.id,
                        studentName: updatedApplication.Student.User.name,
                        offerName: otherApp.Offer.name,
                        reason: 'candidate_accepted_elsewhere'
                    }
                });
            }
        }

        logger.info({ userId, applicationId, newStatus: status }, "Application status updated successfully with notifications sent");
        
        res.json({
            mensaje: status === 'accepted' 
                ? 'Estudiante aceptado exitosamente. Se han rechazado automáticamente sus otras aplicaciones.'
                : 'Estado de aplicación actualizado exitosamente',
            application: updatedApplication
        });

    } catch (err) {
        await transaction.rollback();
        logger.error('Error updateApplicationStatus: ' + err);
        console.error('❌ Error en updateApplicationStatus:', err);
        
        // 🔥 AÑADIR MANEJO DE ERROR DEL SERVICE
        if (err.message.includes('No se encontró empresa')) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }
        
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/{applicationId}:
 *   delete:
 *     summary: Retirar aplicación (solo estudiante)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la aplicación
 *     responses:
 *       200:
 *         description: Aplicación retirada exitosamente
 *       403:
 *         description: No tienes permisos para retirar esta aplicación
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// En la misma función withdrawApplication, asegúrate de que use el flujo correcto:
export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId } = req.user;

    console.log(`🗑️ Attempting to withdraw application - ApplicationID: ${applicationId}, UserID: ${userId}`);

    // 🔥 ENCONTRAR STUDENT PRIMERO
    const student = await Student.findOne({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Perfil de estudiante no encontrado' 
      });
    }

    // 🔥 BUSCAR APLICACIÓN POR STUDENT_ID
    const application = await Application.findOne({
      where: { 
        id: parseInt(applicationId),
        studentId: student.id // Usar studentId, no userId
      },
      include: [
        {
          model: Offer,
          as: 'offer',
          attributes: ['id', 'name', 'sector']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Aplicación no encontrada'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        mensaje: `Solo se pueden retirar aplicaciones pendientes. Estado actual: ${application.status}` 
      });
    }

    await application.update({
      status: 'withdrawn'
    });

    console.log(`✅ Application ${applicationId} withdrawn successfully`);

    res.json({
      success: true,
      mensaje: 'Aplicación retirada exitosamente',
      application: {
        id: application.id,
        status: 'withdrawn',
        offerName: application.offer?.name
      }
    });

  } catch (error) {
    console.error('❌ Error withdrawApplication:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
};
/**
 * @swagger
 * /api/applications/{applicationId}/mark-cv-viewed:
 *   put:
 *     summary: Marcar CV como visto por la empresa
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la aplicación
 *     responses:
 *       200:
 *         description: CV marcado como visto exitosamente
 *       403:
 *         description: No tienes permisos para esta aplicación
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function markCVAsViewed(req, res) {
    const { userId } = req.user;
    const { applicationId } = req.params;

    try {
        await sequelize.transaction(async (t) => {
            // Usar el service para obtener la empresa
            const company = await companyService.getCompanyByUserId(userId);

            // Buscar la aplicación
            const application = await Application.findOne({
                where: { 
                    id: applicationId,
                    companyId: company.id 
                },
                include: [{
                    model: Student,
                    include: [{ model: User }]
                }, {
                    model: Offer
                }],
                transaction: t
            });

            if (!application) {
                return res.status(404).json({ mensaje: 'Aplicación no encontrada o no tienes permisos' });
            }

            // Marcar CV como visto si no lo estaba
            if (!application.cvViewed) {
                await application.update({
                    cvViewed: true,
                    cvViewedAt: new Date()
                }, { transaction: t });

                logger.info({ userId, applicationId, companyId: company.id }, "CV marked as viewed");
            }

            res.json({
                mensaje: 'CV marcado como visto exitosamente',
                application: {
                    id: application.id,
                    cvViewed: true,
                    cvViewedAt: application.cvViewedAt || new Date(),
                    student: {
                        name: application.Student.User.name,
                        surname: application.Student.User.surname
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error markCVAsViewed:', error);
        
        if (error.message.includes('No se encontró empresa')) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }
        
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

export const requestInterview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { applicationId } = req.params;
    const { interviewDetails, companyNotes } = req.body;

    console.log(`📅 Solicitud de entrevista - Application: ${applicationId}, User: ${userId}`);
    console.log(`📅 Interview details received:`, interviewDetails);
    console.log(`📅 Company notes:`, companyNotes);
    console.log(`📅 Interview details type:`, typeof interviewDetails);
    console.log(`📅 Interview details keys:`, interviewDetails ? Object.keys(interviewDetails) : 'null');

    // 🔥 USAR EL SERVICE PARA OBTENER LA EMPRESA (como en otras funciones)
    const company = await companyService.getCompanyByUserId(userId);

    // Buscar la aplicación
    const application = await Application.findOne({
      where: {
        id: applicationId
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'surname', 'email']
            }
          ]
        },
        {
          model: Offer,
          as: 'offer',
          attributes: ['id', 'name', 'companyId']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        mensaje: 'Aplicación no encontrada'
      });
    }

    // Verificar que la oferta pertenece a la compañía del usuario
    if (application.offer.companyId !== company.id) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para modificar esta aplicación'
      });
    }

    // 🔥 GENERAR ENLACE DE REUNIÓN AUTOMÁTICAMENTE PARA ENTREVISTAS REMOTAS
    let finalInterviewDetails = { ...interviewDetails };

    if (interviewDetails.type === 'remoto') {
      // Generar enlace de Google Meet automáticamente
      const generatedLink = meetingService.generateGoogleMeetLink();
      finalInterviewDetails.link = generatedLink;
      console.log(`🔗 Enlace de Google Meet generado automáticamente: ${generatedLink}`);
    }

    // Preparar los datos para guardar
    const interviewDetailsString = JSON.stringify(finalInterviewDetails);
    console.log(`📅 Interview details stringified:`, interviewDetailsString);

    // Actualizar aplicación con detalles de entrevista
    await application.update({
      status: 'interview_requested',
      companyNotes: companyNotes,
      interviewDetails: interviewDetailsString,
      interviewRequestedAt: new Date()
    });

    console.log(`✅ Entrevista solicitada para aplicación ${applicationId}`);
    console.log(`✅ Interview details saved:`, interviewDetailsString);
    console.log(`✅ Company notes saved:`, companyNotes);

    // Verificar que se guardó correctamente
    const updatedApplication = await Application.findByPk(applicationId);
    console.log(`✅ Verificación - Status: ${updatedApplication.status}`);
    console.log(`✅ Verificación - Interview details raw:`, updatedApplication.interviewDetails);
    console.log(`✅ Verificación - Interview details parsed:`, JSON.parse(updatedApplication.interviewDetails));

    // TODO: Enviar notificación al estudiante
    // await notificationService.sendInterviewRequest(application, interviewDetails);

    res.json({
      success: true,
      mensaje: 'Solicitud de entrevista enviada exitosamente',
      application: {
        id: application.id,
        status: 'interview_requested',
        interviewDetails: finalInterviewDetails,
        student: {
          name: application.student.user.name,
          surname: application.student.user.surname,
          email: application.student.user.email
        },
        offer: {
          name: application.offer.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Error requesting interview:', error);
    
    // 🔥 AÑADIR MANEJO DE ERROR DEL SERVICE
    if (error.message.includes('No se encontró empresa')) {
      return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
    }
    
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const confirmInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId } = req.user;
    const { studentNotes } = req.body;

    console.log(`✅ Confirmando entrevista - Application: ${applicationId}, User: ${userId}`);

    // Encontrar el estudiante
    const student = await Student.findOne({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({ 
        mensaje: 'Perfil de estudiante no encontrado' 
      });
    }

    // Buscar la aplicación
    const application = await Application.findOne({
      where: { 
        id: applicationId,
        studentId: student.id,
        status: 'interview_requested'
      },
      include: [
        {
          model: Offer,
          as: 'offer',
          include: [
            {
              model: Company,
              as: 'company'
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ 
        mensaje: 'Aplicación no encontrada o no tiene entrevista pendiente' 
      });
    }

    // Actualizar aplicación
    await application.update({
      status: 'interview_confirmed',
      studentNotes: studentNotes,
      interviewConfirmedAt: new Date()
    });

    console.log(`✅ Entrevista confirmada para aplicación ${applicationId}`);

    res.json({
      success: true,
      mensaje: 'Entrevista confirmada exitosamente',
      application: {
        id: application.id,
        status: 'interview_confirmed',
        interviewDetails: application.interviewDetails ? (() => {
            try {
                return JSON.parse(application.interviewDetails);
            } catch (parseError) {
                console.error(`❌ Error parsing interviewDetails for application ${application.id}:`, parseError.message);
                console.error(`❌ Raw interviewDetails:`, application.interviewDetails);
                return null;
            }
        })() : null,
        offer: {
          name: application.offer.name
        },
        company: {
          name: application.offer.company.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Error confirmando entrevista:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const rejectInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId } = req.user;
    const { rejectionReason, studentNotes } = req.body;

    console.log(`❌ Rechazando entrevista - Application: ${applicationId}, User: ${userId}`);

    // Encontrar el estudiante
    const student = await Student.findOne({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({ 
        mensaje: 'Perfil de estudiante no encontrado' 
      });
    }

    // Buscar la aplicación
    const application = await Application.findOne({
      where: { 
        id: applicationId,
        studentId: student.id,
        status: 'interview_requested'
      },
      include: [
        {
          model: Offer,
          as: 'offer',
          include: [
            {
              model: Company,
              as: 'company'
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ 
        mensaje: 'Aplicación no encontrada o no tiene entrevista pendiente' 
      });
    }

    // Actualizar aplicación
    await application.update({
      status: 'interview_rejected',
      interviewRejectionReason: rejectionReason,
      studentNotes: studentNotes,
      interviewRejectedAt: new Date()
    });

    console.log(`❌ Entrevista rechazada para aplicación ${applicationId}`);

    res.json({
      success: true,
      mensaje: 'Entrevista rechazada',
      application: {
        id: application.id,
        status: 'interview_rejected',
        offer: {
          name: application.offer.name
        },
        company: {
          name: application.offer.company.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Error rechazando entrevista:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
    applyToOffer,
    getUserApplications,
    getCompanyApplications,
    getOfferApplications,
    updateApplicationStatus,
    withdrawApplication,
    requestInterview,
    confirmInterview,
    rejectInterview,
    markCVAsViewed
};
