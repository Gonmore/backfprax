import { AcademicVerification, Student, Scenter, Cv, User, Profamily } from '../models/relations.js';
import logger from '../logs/logger.js';

/**
 * Enviar solicitud de verificación académica (estudiantes)
 */
async function submitAcademicVerification(req, res) {
    try {
        const { userId } = req.user;
        const { scenterId } = req.body;

        // Validar datos requeridos
        if (!scenterId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el ID del centro de estudios'
            });
        }

        // Verificar que el estudiante existe
        const student = await Student.findOne({
            where: { userId },
            include: [{ model: User, as: 'user' }]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Verificar que el centro de estudios existe
        const scenter = await Scenter.findByPk(scenterId);
        if (!scenter) {
            return res.status(404).json({
                success: false,
                message: 'Centro de estudios no encontrado'
            });
        }

        // Verificar si ya existe una solicitud pendiente
        const existingVerification = await AcademicVerification.findOne({
            where: {
                studentId: student.id,
                scenterId: scenterId,
                status: 'pending'
            }
        });

        if (existingVerification) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una solicitud de verificación pendiente para este centro de estudios'
            });
        }

        // Obtener datos académicos del CV del estudiante
        const cv = await Cv.findOne({
            where: { studentId: student.id }
        });

        if (!cv || !cv.academicBackground) {
            return res.status(400).json({
                success: false,
                message: 'Debes completar tu información académica en el CV antes de solicitar verificación'
            });
        }

        // Preparar datos académicos para verificación
        const academicData = {
            scenter: cv.academicBackground.scenter,
            profamily: cv.academicBackground.profamily,
            status: cv.academicBackground.status,
            submittedAt: new Date().toISOString()
        };

        // Crear la solicitud de verificación
        const verification = await AcademicVerification.create({
            studentId: student.id,
            scenterId: scenterId,
            academicData: academicData,
            status: 'pending',
            submittedAt: new Date()
        });

        // Actualizar el estado del CV a 'pending'
        await Cv.update(
            { academicVerificationStatus: 'pending' },
            { where: { studentId: student.id } }
        );

        logger.info(`Academic verification submitted by student ${userId} for scenter ${scenterId}`);

        res.json({
            success: true,
            message: 'Solicitud de verificación enviada exitosamente',
            data: {
                verificationId: verification.id,
                status: 'pending'
            }
        });

    } catch (error) {
        logger.error('Error submitAcademicVerification: ' + error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener solicitudes de verificación para un centro de estudios
 */
async function getScenterVerifications(req, res) {
    try {
        const { userId } = req.user;

        // Verificar que el usuario pertenece a un centro de estudios y obtener su scenter
        const user = await User.findByPk(userId, {
            include: {
                model: Scenter,
                as: 'scenters',
                through: { 
                    attributes: [],
                    where: { isActive: true }
                },
                required: false
            }
        });

        if (!user || user.role !== 'scenter' || !user.scenters || user.scenters.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Acceso no autorizado - Usuario no está asociado a ningún centro de estudios activo'
            });
        }

        const userScenterIds = user.scenters.map(scenter => scenter.id);

        // Obtener verificaciones solo para los scenters del usuario
        const verifications = await AcademicVerification.findAll({
            where: {
                scenterId: userScenterIds
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
                        },
                        {
                            model: Cv,
                            as: 'cv',
                            attributes: ['academicBackground']
                        }
                    ]
                },
                {
                    model: Scenter,
                    as: 'scenter',
                    attributes: ['id', 'name']
                }
            ],
            order: [['submittedAt', 'DESC']]
        });

        // Transformar los datos para el frontend
        const transformedVerifications = await Promise.all(verifications.map(async (verification) => {
            try {
                let profamilyData = null;
                if (verification.student?.cv?.academicBackground?.profamily) {
                    try {
                        const profamily = await Profamily.findByPk(verification.student.cv.academicBackground.profamily);
                        profamilyData = profamily ? { id: profamily.id, name: profamily.name } : null;
                    } catch (error) {
                        console.error('Error fetching profamily:', error);
                    }
                }

                return {
                    id: verification.id,
                    studentId: verification.studentId,
                    scenterId: verification.scenterId,
                    status: verification.status,
                    comments: verification.comments,
                    submittedAt: verification.submittedAt,
                    reviewedAt: verification.verifiedAt,
                    reviewedBy: verification.verifiedBy,
                    student: verification.student?.user ? {
                        id: verification.student.user.id,
                        name: `${verification.student.user.name} ${verification.student.user.surname || ''}`.trim(),
                        email: verification.student.user.email
                    } : null,
                    scenter: verification.scenter,
                    cv: {
                        academicBackground: verification.student?.cv?.academicBackground || {},
                        profamily: profamilyData
                    }
                };
            } catch (error) {
                console.error('Error transforming verification:', verification.id, error);
                return null;
            }
        })).then(results => results.filter(r => r !== null));

        res.json({
            success: true,
            verifications: transformedVerifications
        });

    } catch (error) {
        logger.error('Error getScenterVerifications: ' + error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Revisar verificación académica (aprobar/rechazar)
 */
async function reviewVerification(req, res) {
    try {
        const { userId } = req.user;
        const { verificationId } = req.params;
        const { action, comments } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Acción inválida. Debe ser "approve" o "reject"'
            });
        }

        if (action === 'reject' && (!comments || comments.trim().length < 10)) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar comentarios explicando el rechazo (mínimo 10 caracteres)'
            });
        }

        // Buscar la verificación
        const verification = await AcademicVerification.findByPk(verificationId, {
            include: [
                { model: Student, as: 'student' },
                { model: Scenter, as: 'scenter' }
            ]
        });

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verificación no encontrada'
            });
        }

        if (verification.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Esta verificación ya fue procesada'
            });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        // Actualizar la verificación
        await verification.update({
            status: newStatus,
            verifiedBy: userId,
            verifiedAt: new Date(),
            comments: comments || null
        });

        // Actualizar el CV del estudiante
        const cvUpdate = {
            academicVerificationStatus: newStatus === 'approved' ? 'verified' : 'rejected',
            academicVerifiedAt: new Date(),
            academicVerifiedBy: userId
        };

        await Cv.update(cvUpdate, { where: { studentId: verification.studentId } });

        logger.info(`Academic verification ${verificationId} ${action}d by user ${userId}`);

        res.json({
            success: true,
            message: `Verificación ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`
        });

    } catch (error) {
        logger.error('Error reviewVerification: ' + error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener estado de verificación del estudiante
 */
async function getVerificationStatus(req, res) {
    try {
        const { userId } = req.user;

        // Buscar estudiante
        const student = await Student.findOne({
            where: { userId }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Buscar CV
        const cv = await Cv.findOne({
            where: { studentId: student.id }
        });

        // Buscar verificaciones
        const verifications = await AcademicVerification.findAll({
            where: { studentId: student.id },
            include: [
                {
                    model: Scenter,
                    as: 'scenter',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'reviewedByUser',
                    attributes: ['name', 'surname']
                }
            ],
            order: [['submittedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                currentStatus: cv?.academicVerificationStatus || 'unverified',
                verifiedAt: cv?.academicVerifiedAt || null,
                verifications: verifications
            }
        });

    } catch (error) {
        logger.error('Error getVerificationStatus: ' + error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    submitAcademicVerification,
    getScenterVerifications,
    reviewVerification,
    getVerificationStatus
};