import { Scenter, Profamily, ScenterProfamily, User, Student, Cv, AcademicVerification, Tutor, Application, Offer } from '../models/relations.js';
import logger from '../logs/logger.js';
import { Status } from '../constants/index.js';
import { encriptar } from '../common/bcrypt.js';
import sequelize from '../database/database.js';
import * as XLSX from 'xlsx';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Middleware para verificar que el usuario es de tipo scenter y obtener su scenter
 */
export async function verifyScenterUser(req, res, next) {
    try {
        const { userId } = req.user;

        const user = await User.findByPk(userId, {
            include: {
                model: Scenter,
                as: 'scenters',
                through: { attributes: [] },
                where: { active: true },
                required: false
            }
        });

        if (!user || user.role !== 'scenter' || !user.scenters || user.scenters.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Acceso no autorizado - Usuario no está asociado a ningún centro de estudios activo'
            });
        }

        // Agregar información del scenter al request
        req.scenterUser = {
            user: user,
            scenters: user.scenters,
            scenterIds: user.scenters.map(scenter => scenter.id)
        };

        next();
    } catch (error) {
        logger.error('Error verifyScenterUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener información completa del scenter del usuario
 */
export async function getScenterInfo(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0]; // Por ahora tomamos el primer scenter

        // Obtener estadísticas del scenter
        let studentCount, verificationCount, tutorCount, profamilyCount;
        try {
            [studentCount, verificationCount, tutorCount, profamilyCount] = await Promise.all([
                sequelize.query(
                    `SELECT COUNT(*) as count FROM students s INNER JOIN cvs cv ON s.id = cv."studentId" WHERE cv."academicBackground"->>'scenter' = $1`,
                    {
                        bind: [scenter.name],
                        type: sequelize.QueryTypes.SELECT
                    }
                ).then(result => parseInt(result[0].count)).catch(err => {
                    console.error('Error in student count:', err);
                    return 0;
                }),
                AcademicVerification.count({
                    where: { scenterId: scenter.id }
                }).catch(err => {
                    console.error('Error in verification count:', err);
                    return 0;
                }),
                Tutor.count({
                    where: { tutorId: scenter.id }
                }).catch(err => {
                    console.error('Error in tutor count:', err);
                    return 0;
                }),
                sequelize.query(
                    `SELECT COUNT(*) as count FROM "scenter_profamilys" WHERE "scenterId" = $1`,
                    {
                        bind: [scenter.id],
                        type: sequelize.QueryTypes.SELECT
                    }
                ).then(result => parseInt(result[0].count)).catch(err => {
                    console.error('Error in profamily count:', err);
                    return 0;
                })
            ]);
        } catch (error) {
            console.error('Error in Promise.all:', error);
            // Set defaults
            studentCount = 0;
            verificationCount = 0;
            tutorCount = 0;
            profamilyCount = 0;
        }

        res.json({
            success: true,
            data: {
                scenter: {
                    id: scenter.id,
                    name: scenter.name,
                    code: scenter.code,
                    city: scenter.city,
                    address: scenter.address,
                    phone: scenter.phone,
                    email: scenter.email,
                    active: scenter.active
                },
                stats: {
                    students: studentCount,
                    pendingVerifications: await AcademicVerification.count({
                        where: { scenterId: scenter.id, status: 'pending' }
                    }).catch(err => {
                        console.error('Error in pending verifications:', err);
                        return 0;
                    }),
                    totalVerifications: verificationCount,
                    tutors: tutorCount,
                    profamilys: profamilyCount
                }
            }
        });

    } catch (error) {
        logger.error('Error getScenterInfo:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo información del centro'
        });
    }
}

/**
 * Actualizar información del scenter
 */
export async function updateScenterInfo(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];
        const { name, code, city, address, phone, email } = req.body;

        await scenter.update({
            name: name || scenter.name,
            code: code || scenter.code,
            city: city || scenter.city,
            address: address || scenter.address,
            phone: phone || scenter.phone,
            email: email || scenter.email
        });

        logger.info(`Scenter ${scenter.id} updated by user ${scenterUser.user.id}`);

        res.json({
            success: true,
            message: 'Información del centro actualizada exitosamente',
            data: scenter
        });

    } catch (error) {
        logger.error('Error updateScenterInfo:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando información del centro'
        });
    }
}

/**
 * Agregar una nueva familia profesional al scenter
 */
export async function addProfamilyToScenter(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la familia profesional es requerido'
            });
        }

        // Verificar si ya existe una profamily con ese nombre
        const existingProfamily = await Profamily.findOne({
            where: { name: name.trim() }
        });

        if (existingProfamily) {
            // Si ya existe, solo asociarla al scenter
            const existingRelation = await ScenterProfamily.findOne({
                where: { scenterId: scenter.id, profamilyId: existingProfamily.id }
            });

            if (existingRelation) {
                return res.status(409).json({
                    success: false,
                    message: 'Esta familia profesional ya está asociada al centro'
                });
            }

            await ScenterProfamily.create({
                scenterId: scenter.id,
                profamilyId: existingProfamily.id
            });

            logger.info(`Existing profamily ${existingProfamily.id} associated with scenter ${scenter.id}`);

            return res.status(201).json({
                success: true,
                message: 'Familia profesional existente asociada al centro exitosamente',
                data: existingProfamily
            });
        }

        // Crear nueva profamily
        const profamily = await Profamily.create({
            name: name.trim(),
            description: description || null
        });

        // Asociar al scenter
        await ScenterProfamily.create({
            scenterId: scenter.id,
            profamilyId: profamily.id
        });

        logger.info(`New profamily ${profamily.id} created and associated with scenter ${scenter.id}`);

        res.status(201).json({
            success: true,
            message: 'Familia profesional creada y asociada al centro exitosamente',
            data: profamily
        });

    } catch (error) {
        logger.error('Error addProfamilyToScenter:', error);
        res.status(500).json({
            success: false,
            message: 'Error agregando familia profesional'
        });
    }
}

/**
 * Obtener familias profesionales del scenter
 */
export async function getScenterProfamilys(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];

        // Use direct query instead of association method
        const profamilys = await sequelize.query(
            `SELECT p.* FROM profamilys p
             INNER JOIN scenter_profamilys sp ON p.id = sp."profamilyId"
             WHERE sp."scenterId" = $1
             ORDER BY p.name ASC`,
            {
                bind: [scenter.id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: profamilys
        });

    } catch (error) {
        logger.error('Error getScenterProfamilys:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo familias profesionales'
        });
    }
}

/**
 * Agregar estudiante con información académica ya verificada
 */
export async function addVerifiedStudent(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];
        const {
            name, surname, email, phone,
            grade, course, car,
            profamilyId, academicBackground
        } = req.body;

        // Validar datos requeridos
        if (!name || !surname || !email || !profamilyId) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido, email y familia profesional son requeridos'
            });
        }

        // Verificar que la profamily pertenece al scenter
        const profamilyRelation = await ScenterProfamily.findOne({
            where: { scenterId: scenter.id, profamilyId }
        });

        if (!profamilyRelation) {
            return res.status(400).json({
                success: false,
                message: 'La familia profesional seleccionada no pertenece a este centro'
            });
        }

        // Verificar que no existe un usuario con ese email
        const existingUser = await User.findOne({
            where: { email: email.trim() }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario con este email'
            });
        }

        // Generar contraseña temporal
        const tempPassword = Math.random().toString(36).slice(-8) + 'Temp!';
        const hashedPassword = await encriptar(tempPassword);

        // Crear usuario
        const user = await User.create({
            username: email.split('@')[0],
            email: email.trim(),
            password: hashedPassword,
            role: 'student',
            name: name.trim(),
            surname: surname.trim(),
            phone: phone || null,
            active: true,
            status: 'active'
        });

        // Crear estudiante
        const student = await Student.create({
            userId: user.id,
            grade: grade || null,
            course: course || null,
            car: car || false,
            profamilyId: profamilyId
        });

        // Crear CV con información académica verificada
        const cvData = {
            studentId: student.id,
            academicBackground: {
                ...academicBackground,
                scenter: scenter.name,
                profamily: profamilyId,
                status: 'verified'
            },
            academicVerificationStatus: 'verified',
            academicVerifiedAt: new Date(),
            academicVerifiedBy: scenterUser.user.id
        };

        const cv = await Cv.create(cvData);

        logger.info(`Verified student ${user.id} created by scenter user ${scenterUser.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Estudiante verificado creado exitosamente',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email
                },
                student: {
                    id: student.id,
                    grade: student.grade,
                    course: student.course
                },
                tempPassword: tempPassword, // Para enviar al estudiante
                cv: {
                    id: cv.id,
                    academicVerificationStatus: cv.academicVerificationStatus
                }
            }
        });

    } catch (error) {
        logger.error('Error addVerifiedStudent:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando estudiante verificado'
        });
    }
}

/**
 * Asignar tutor a estudiante
 */
export async function assignTutorToStudent(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];
        const { studentId, tutorId } = req.body;

        if (!studentId || !tutorId) {
            return res.status(400).json({
                success: false,
                message: 'ID del estudiante y tutor son requeridos'
            });
        }

        // Verificar que el estudiante existe y pertenece al scenter
        const student = await sequelize.query(
            `SELECT s.* FROM students s INNER JOIN cvs cv ON s.id = cv."studentId" WHERE s.id = $1 AND cv."academicBackground"->>'scenter' = $2`,
            {
                bind: [studentId, scenter.name],
                type: sequelize.QueryTypes.SELECT
            }
        ).then(results => results.length > 0 ? results[0] : null);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado o no pertenece a este centro'
            });
        }

        // Verificar que el tutor pertenece al scenter
        const tutor = await Tutor.findOne({
            where: { id: tutorId, tutorId: scenter.id }
        });

        if (!tutor) {
            return res.status(404).json({
                success: false,
                message: 'Tutor no encontrado o no pertenece a este centro'
            });
        }

        // Actualizar el tutor del estudiante
        await sequelize.query(
            `UPDATE students SET "tutorId" = $1, "updatedAt" = NOW() WHERE id = $2`,
            {
                bind: [tutorId, studentId],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        logger.info(`Tutor ${tutorId} assigned to student ${studentId} by scenter user ${scenterUser.user.id}`);

        res.json({
            success: true,
            message: 'Tutor asignado al estudiante exitosamente'
        });

    } catch (error) {
        logger.error('Error assignTutorToStudent:', error);
        res.status(500).json({
            success: false,
            message: 'Error asignando tutor al estudiante'
        });
    }
}

/**
 * Agregar estudiantes desde archivo Excel
 */
export async function bulkAddVerifiedStudents(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado un archivo Excel'
            });
        }

        // Leer el archivo Excel
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El archivo Excel está vacío o no tiene el formato correcto'
            });
        }

        const results = {
            success: [],
            errors: [],
            total: jsonData.length
        };

        // Procesar cada fila del Excel
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNumber = i + 2; // +2 porque Excel empieza en 1 y hay headers

            try {
                // Mapear columnas comunes (pueden variar según el centro)
                const studentData = {
                    name: row.Nombre || row.nombre || row.Name || row.name,
                    surname: row.Apellido || row.apellido || row.Apellidos || row.apellidos || row.Surname || row.surname,
                    email: row.Email || row.email || row.Correo || row.correo,
                    phone: row.Telefono || row.telefono || row.Phone || row.phone || row.Teléfono || row.teléfono,
                    grade: row.Grado || row.grado || row.Titulo || row.titulo || row.Title || row.title,
                    course: row.Curso || row.curso || row.Course || row.course,
                    car: row.Vehiculo || row.vehiculo || row.Coche || row.coche || row.Car || row.car || false,
                    profamilyName: row.FamiliaProfesional || row.familiaprofesional || row.Profamily || row.profamily || row['Familia Profesional'] || row['familia profesional'],
                    academicBackground: {
                        grade: row.Grado || row.grado || row.Titulo || row.titulo,
                        course: row.Curso || row.curso,
                        enrollmentYear: row.AñoMatricula || row.añoMatricula || row['Año Matrícula'] || row['año matrícula'],
                        graduationYear: row.AñoGraduacion || row.añoGraduacion || row['Año Graduación'] || row['año graduación'],
                        gpa: row.NotaMedia || row.notaMedia || row.GPA || row.gpa,
                        status: 'verified'
                    }
                };

                // Validar datos requeridos
                if (!studentData.name || !studentData.surname || !studentData.email) {
                    results.errors.push({
                        row: rowNumber,
                        message: `Faltan datos requeridos: ${!studentData.name ? 'Nombre, ' : ''}${!studentData.surname ? 'Apellido, ' : ''}${!studentData.email ? 'Email' : ''}`.replace(/, $/, '')
                    });
                    continue;
                }

                // Verificar que no existe un usuario con ese email
                const existingUser = await User.findOne({
                    where: { email: studentData.email.trim() }
                });

                if (existingUser) {
                    results.errors.push({
                        row: rowNumber,
                        message: `Ya existe un usuario con el email: ${studentData.email}`
                    });
                    continue;
                }

                // Buscar o crear familia profesional
                let profamilyId = null;
                if (studentData.profamilyName) {
                    // Buscar familia profesional existente
                    let profamily = await Profamily.findOne({
                        where: { name: studentData.profamilyName.trim() }
                    });

                    if (!profamily) {
                        // Crear nueva familia profesional
                        profamily = await Profamily.create({
                            name: studentData.profamilyName.trim(),
                            description: `Familia profesional: ${studentData.profamilyName.trim()}`
                        });
                        logger.info(`New profamily ${profamily.id} created from Excel import`);
                    }

                    // Verificar si ya está asociada al centro
                    const existingRelation = await ScenterProfamily.findOne({
                        where: { scenterId: scenter.id, profamilyId: profamily.id }
                    });

                    if (!existingRelation) {
                        // Asociar al centro
                        await ScenterProfamily.create({
                            scenterId: scenter.id,
                            profamilyId: profamily.id
                        });
                    }

                    profamilyId = profamily.id;
                }

                if (!profamilyId) {
                    results.errors.push({
                        row: rowNumber,
                        message: 'No se pudo determinar la familia profesional'
                    });
                    continue;
                }

                // Generar contraseña temporal
                const tempPassword = Math.random().toString(36).slice(-8) + 'Temp!';
                const hashedPassword = await encriptar(tempPassword);

                // Crear usuario
                const user = await User.create({
                    username: studentData.email.split('@')[0] + Math.random().toString(36).slice(-4),
                    email: studentData.email.trim(),
                    password: hashedPassword,
                    role: 'student',
                    name: studentData.name.trim(),
                    surname: studentData.surname.trim(),
                    phone: studentData.phone ? studentData.phone.toString().trim() : null,
                    active: true,
                    status: 'active'
                });

                // Crear estudiante
                const student = await Student.create({
                    userId: user.id,
                    grade: studentData.grade || null,
                    course: studentData.course || null,
                    car: Boolean(studentData.car),
                    profamilyId: profamilyId
                });

                // Crear CV con información académica verificada
                const cvData = {
                    studentId: student.id,
                    academicBackground: {
                        ...studentData.academicBackground,
                        scenter: scenter.name,
                        profamily: profamilyId,
                        status: 'verified'
                    },
                    academicVerificationStatus: 'verified',
                    academicVerifiedAt: new Date(),
                    academicVerifiedBy: scenterUser.user.id
                };

                const cv = await Cv.create(cvData);

                results.success.push({
                    row: rowNumber,
                    student: {
                        id: student.id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        tempPassword: tempPassword
                    }
                });

                logger.info(`Verified student ${user.id} created from Excel by scenter user ${scenterUser.user.id}`);

            } catch (rowError) {
                results.errors.push({
                    row: rowNumber,
                    message: rowError.message || 'Error procesando la fila'
                });
                logger.error(`Error processing row ${rowNumber}:`, rowError);
            }
        }

        // Limpiar archivo temporal
        try {
            fs.unlinkSync(req.file.path);
        } catch (fileError) {
            logger.error('Error deleting temp file:', fileError);
        }

        res.json({
            success: true,
            message: `Procesamiento completado. ${results.success.length} estudiantes creados, ${results.errors.length} errores.`,
            data: {
                total: results.total,
                successCount: results.success.length,
                errorCount: results.errors.length,
                success: results.success,
                errors: results.errors
            }
        });

    } catch (error) {
        logger.error('Error bulkAddVerifiedStudents:', error);

        // Limpiar archivo temporal en caso de error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (fileError) {
                logger.error('Error deleting temp file on error:', fileError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error procesando archivo Excel',
            error: error.message
        });
    }
}
export async function getScenterStudents(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];

        const students = await sequelize.query(
            `SELECT s.*, cv."academicVerificationStatus", cv."academicVerifiedAt",
                    u.id as "user.id", u.name as "user.name", u.surname as "user.surname", 
                    u.email as "user.email", u.phone as "user.phone", u.active as "user.active",
                    pf.id as "profamily.id", pf.name as "profamily.name",
                    t.id as "tutor.id", t.name as "tutor.name", t.email as "tutor.email"
             FROM students s 
             INNER JOIN cvs cv ON s.id = cv."studentId" AND cv."academicBackground"->>'scenter' = $1
             INNER JOIN users u ON s."userId" = u.id
             LEFT JOIN profamilys pf ON s."profamilyId" = pf.id
             LEFT JOIN tutors t ON s."tutorId" = t.id
             ORDER BY s."createdAt" DESC`,
            {
                bind: [scenter.name],
                type: sequelize.QueryTypes.SELECT
            }
        );

        // Transformar datos para el frontend
        let transformedStudents = [];
        try {
            transformedStudents = students.map(student => ({
                id: student.id,
                user: {
                    id: student['user.id'],
                    name: student['user.name'],
                    surname: student['user.surname'],
                    email: student['user.email'],
                    phone: student['user.phone'],
                    active: student['user.active']
                },
                grade: student.grade,
                course: student.course,
                car: student.car,
                profamily: student['profamily.id'] ? {
                    id: student['profamily.id'],
                    name: student['profamily.name']
                } : null,
                tutor: student['tutor.id'] ? {
                    id: student['tutor.id'],
                    name: student['tutor.name'],
                    email: student['tutor.email']
                } : null,
                cv: {
                    verificationStatus: student.academicVerificationStatus,
                    verifiedAt: student.academicVerifiedAt
                },
                applications: [], // Por ahora vacío, se puede agregar después si es necesario
                applicationStats: {
                    total: 0,
                    pending: 0,
                    reviewed: 0,
                    accepted: 0,
                    rejected: 0
                }
            }));
        } catch (error) {
            console.error('Error transforming students:', error);
            transformedStudents = [];
        }

        res.json({
            success: true,
            data: transformedStudents
        });

    } catch (error) {
        logger.error('Error getScenterStudents:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estudiantes del centro',
            error: error.message
        });
    }
}

/**
 * Obtener estadísticas del scenter
 */
export async function getScenterStats(req, res) {
    try {
        const { scenterUser } = req;
        const scenter = scenterUser.scenters[0];

        // Estadísticas de estudiantes
        const [totalStudents, verifiedStudents, unverifiedStudents] = await Promise.all([
            sequelize.query(
                `SELECT COUNT(*) as count FROM students s INNER JOIN cvs cv ON s.id = cv."studentId" WHERE cv."academicBackground"->>'scenter' = $1`,
                {
                    bind: [scenter.name],
                    type: sequelize.QueryTypes.SELECT
                }
            ).then(result => parseInt(result[0].count)).catch(err => {
                console.error('Error in total students:', err);
                return 0;
            }),
            sequelize.query(
                `SELECT COUNT(*) as count FROM students s INNER JOIN cvs cv ON s.id = cv."studentId"
                 WHERE cv."academicBackground"->>'scenter' = $1 AND cv."academicVerificationStatus" = 'verified'`,
                {
                    bind: [scenter.name],
                    type: sequelize.QueryTypes.SELECT
                }
            ).then(result => parseInt(result[0].count)).catch(err => {
                console.error('Error in verified students:', err);
                return 0;
            }),
            sequelize.query(
                `SELECT COUNT(*) as count FROM students s INNER JOIN cvs cv ON s.id = cv."studentId"
                 WHERE cv."academicBackground"->>'scenter' = $1 AND cv."academicVerificationStatus" IN ('unverified', 'pending')`,
                {
                    bind: [scenter.name],
                    type: sequelize.QueryTypes.SELECT
                }
            ).then(result => parseInt(result[0].count)).catch(err => {
                console.error('Error in unverified students:', err);
                return 0;
            })
        ]);

        // Estadísticas de verificaciones
        const verificationStats = await AcademicVerification.findAll({
            where: { scenterId: scenter.id },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('status')), 'count']
            ],
            group: ['status']
        }).catch(err => {
            console.error('Error in verification stats:', err);
            return [];
        });

        // Estadísticas de postulaciones
        const applicationStats = await sequelize.query(
            `SELECT a.status, COUNT(*) as count
             FROM applications a
             INNER JOIN students s ON a."studentId" = s.id
             INNER JOIN cvs cv ON s.id = cv."studentId" AND cv."academicBackground"->>'scenter' = $1
             GROUP BY a.status`,
            {
                bind: [scenter.name],
                type: sequelize.QueryTypes.SELECT
            }
        ).catch(err => {
            console.error('Error in application stats:', err);
            return [];
        });

        // Transformar estadísticas
        const verifications = {};
        try {
            verificationStats.forEach(stat => {
                const status = stat.dataValues ? stat.dataValues.status : stat.status;
                const count = stat.dataValues ? stat.dataValues.count : stat.count;
                verifications[status] = parseInt(count);
            });
        } catch (error) {
            console.error('Error transforming verifications:', error);
        }

        const applications = {};
        try {
            applicationStats.forEach(stat => {
                applications[stat.status] = parseInt(stat.count);
            });
        } catch (error) {
            console.error('Error transforming applications:', error);
        }

        // Calcular totales de manera segura
        let verificationTotal = 0;
        let applicationTotal = 0;
        try {
            verificationTotal = Object.values(verifications).reduce((a, b) => a + b, 0);
            applicationTotal = Object.values(applications).reduce((a, b) => a + b, 0);
        } catch (error) {
            console.error('Error calculating totals:', error);
        }

        const responseData = {
            success: true,
            data: {
                students: {
                    total: totalStudents || 0,
                    verified: verifiedStudents || 0,
                    unverified: unverifiedStudents || 0
                },
                verifications: Object.assign({}, { total: verificationTotal || 0 }, verifications),
                applications: Object.assign({}, { total: applicationTotal || 0 }, applications)
            }
        };

        res.json(responseData);

    } catch (error) {
        logger.error('Error getScenterStats:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas del centro',
            error: error.message
        });
    }
}

export default {
    verifyScenterUser,
    getScenterInfo,
    updateScenterInfo,
    addProfamilyToScenter,
    getScenterProfamilys,
    addVerifiedStudent,
    bulkAddVerifiedStudents,
    assignTutorToStudent,
    getScenterStudents,
    getScenterStats
};