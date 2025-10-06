import { Student, Skill, StudentSkill } from '../models/relations.js';
import { Op } from 'sequelize';

export const studentSkillController = {
    // Obtener todas las skills de un estudiante
    getStudentSkills: async (req, res) => {
        try {
            const { studentId } = req.params;
            
            // Obtener las relaciones StudentSkill con la información de Skill
            const studentSkills = await StudentSkill.findAll({
                where: { studentId },
                include: [{
                    model: Skill,
                    as: 'skill',
                    attributes: ['id', 'name', 'category']
                }],
                order: [['createdAt', 'DESC']]
            });

            // Formatear la respuesta
            const skillsWithDetails = studentSkills.map(studentSkill => ({
                id: studentSkill.skill.id,
                name: studentSkill.skill.name,
                category: studentSkill.skill.category, // Usar 'category' como 'category'
                proficiencyLevel: studentSkill.proficiencyLevel,
                yearsOfExperience: studentSkill.yearsOfExperience,
                isVerified: studentSkill.isVerified,
                certificationUrl: studentSkill.certificationUrl,
                notes: studentSkill.notes,
                addedAt: studentSkill.createdAt
            }));

            res.json(skillsWithDetails);

        } catch (error) {
            console.error('Error al obtener skills del estudiante:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: error.message,
                code: 'GET_STUDENT_SKILLS_ERROR'
            });
        }
    },

    // Agregar una skill a un estudiante
    addStudentSkill: async (req, res) => {
        try {
            const { studentId } = req.params;
            const { 
                skillId, 
                proficiencyLevel = 'beginner', 
                yearsOfExperience = 0,
                certificationUrl,
                notes 
            } = req.body;

            // Validar que el estudiante existe
            const student = await Student.findByPk(studentId);
            if (!student) {
                return res.status(404).json({ 
                    error: 'Estudiante no encontrado',
                    code: 'STUDENT_NOT_FOUND'
                });
            }

            // Validar que la skill existe
            const skill = await Skill.findByPk(skillId);
            if (!skill) {
                return res.status(404).json({ 
                    error: 'Skill no encontrada',
                    code: 'SKILL_NOT_FOUND'
                });
            }

            // Verificar si ya existe la relación
            const existingRelation = await StudentSkill.findOne({
                where: { studentId, skillId }
            });

            if (existingRelation) {
                return res.status(409).json({ 
                    error: 'El estudiante ya tiene esta skill asignada',
                    code: 'SKILL_ALREADY_EXISTS',
                    existingSkill: {
                        skillName: skill.name,
                        proficiencyLevel: existingRelation.proficiencyLevel,
                        yearsOfExperience: existingRelation.yearsOfExperience
                    }
                });
            }

            // Crear la relación
            const studentSkill = await StudentSkill.create({
                studentId,
                skillId,
                proficiencyLevel,
                yearsOfExperience,
                certificationUrl,
                notes
            });

            // Obtener la skill con detalles para la respuesta
            const skillWithDetails = await Skill.findByPk(skillId);

            res.status(201).json({
                message: 'Skill agregada exitosamente',
                studentSkill: {
                    id: studentSkill.id,
                    studentId,
                    skill: {
                        id: skillWithDetails.id,
                        name: skillWithDetails.name,
                        category: skillWithDetails.category,
                        description: skillWithDetails.description
                    },
                    proficiencyLevel: studentSkill.proficiencyLevel,
                    yearsOfExperience: studentSkill.yearsOfExperience,
                    isVerified: studentSkill.isVerified,
                    certificationUrl: studentSkill.certificationUrl,
                    notes: studentSkill.notes,
                    addedAt: studentSkill.addedAt
                }
            });

        } catch (error) {
            console.error('Error al agregar skill al estudiante:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: error.message,
                code: 'ADD_STUDENT_SKILL_ERROR'
            });
        }
    },

    // Actualizar una skill de un estudiante
    updateStudentSkill: async (req, res) => {
        try {
            const { studentId, skillId } = req.params;
            const { 
                proficiencyLevel,
                yearsOfExperience,
                certificationUrl,
                notes 
            } = req.body;

            // Buscar la relación existente
            const studentSkill = await StudentSkill.findOne({
                where: { studentId, skillId },
                include: [{
                    model: Skill,
                    as: 'skill'
                }]
            });

            if (!studentSkill) {
                return res.status(404).json({ 
                    error: 'Relación estudiante-skill no encontrada',
                    code: 'STUDENT_SKILL_NOT_FOUND'
                });
            }

            // Actualizar solo los campos proporcionados
            const updateData = {};
            if (proficiencyLevel !== undefined) updateData.proficiencyLevel = proficiencyLevel;
            if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
            if (certificationUrl !== undefined) updateData.certificationUrl = certificationUrl;
            if (notes !== undefined) updateData.notes = notes;

            await studentSkill.update(updateData);

            res.json({
                message: 'Skill actualizada exitosamente',
                studentSkill: {
                    id: studentSkill.id,
                    studentId,
                    skill: {
                        id: studentSkill.skill.id,
                        name: studentSkill.skill.name,
                        category: studentSkill.skill.category
                    },
                    proficiencyLevel: studentSkill.proficiencyLevel,
                    yearsOfExperience: studentSkill.yearsOfExperience,
                    isVerified: studentSkill.isVerified,
                    certificationUrl: studentSkill.certificationUrl,
                    notes: studentSkill.notes,
                    lastUpdated: studentSkill.lastUpdated
                }
            });

        } catch (error) {
            console.error('Error al actualizar skill del estudiante:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: error.message,
                code: 'UPDATE_STUDENT_SKILL_ERROR'
            });
        }
    },

    // Eliminar una skill de un estudiante
    removeStudentSkill: async (req, res) => {
        try {
            const { studentId, skillId } = req.params;

            const studentSkill = await StudentSkill.findOne({
                where: { studentId, skillId },
                include: [{
                    model: Skill,
                    as: 'skill'
                }]
            });

            if (!studentSkill) {
                return res.status(404).json({ 
                    error: 'Relación estudiante-skill no encontrada',
                    code: 'STUDENT_SKILL_NOT_FOUND'
                });
            }

            const skillName = studentSkill.skill.name;
            await studentSkill.destroy();

            res.json({
                message: `Skill "${skillName}" eliminada exitosamente del estudiante`,
                removedSkill: {
                    skillId: parseInt(skillId),
                    skillName,
                    studentId: parseInt(studentId)
                }
            });

        } catch (error) {
            console.error('Error al eliminar skill del estudiante:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: error.message,
                code: 'REMOVE_STUDENT_SKILL_ERROR'
            });
        }
    },

    // Obtener skills disponibles que un estudiante puede agregar
    getAvailableSkills: async (req, res) => {
        try {
            const { studentId } = req.params;

            // Obtener skills que el estudiante ya tiene
            const studentSkills = await StudentSkill.findAll({
                where: { studentId },
                attributes: ['skillId']
            });

            const existingSkillIds = studentSkills.map(ss => ss.skillId);

            // Obtener skills que NO tiene el estudiante
            const availableSkills = await Skill.findAll({
                where: {
                    id: {
                        [Op.notIn]: existingSkillIds
                    }
                },
                order: [['category', 'ASC'], ['name', 'ASC']]
            });

            res.json({
                studentId: parseInt(studentId),
                availableSkills: availableSkills.map(skill => ({
                    id: skill.id,
                    name: skill.name,
                    category: skill.category,
                    description: skill.description,
                    demandLevel: skill.demandLevel
                })),
                totalAvailable: availableSkills.length
            });

        } catch (error) {
            console.error('Error al obtener skills disponibles:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: error.message,
                code: 'GET_AVAILABLE_SKILLS_ERROR'
            });
        }
    },

    // Verificar una skill de estudiante (solo para tutores/administradores)
    verifyStudentSkill: async (req, res) => {
        try {
            const { studentId, skillId } = req.params;
            const { isVerified = true, verificationNotes } = req.body;

            const studentSkill = await StudentSkill.findOne({
                where: { studentId, skillId },
                include: [
                    { model: Student, as: 'student' },
                    { model: Skill, as: 'skill' }
                ]
            });

            if (!studentSkill) {
                return res.status(404).json({ 
                    error: 'Relación estudiante-skill no encontrada',
                    code: 'STUDENT_SKILL_NOT_FOUND'
                });
            }

            await studentSkill.update({ 
                isVerified,
                notes: verificationNotes ? 
                    `${studentSkill.notes || ''}\n[VERIFICACIÓN]: ${verificationNotes}`.trim() :
                    studentSkill.notes
            });

            res.json({
                message: `Skill ${isVerified ? 'verificada' : 'marcada como no verificada'} exitosamente`,
                studentSkill: {
                    studentName: studentSkill.student.name,
                    skillName: studentSkill.skill.name,
                    isVerified: studentSkill.isVerified,
                    proficiencyLevel: studentSkill.proficiencyLevel,
                    lastUpdated: studentSkill.lastUpdated
                }
            });

        } catch (error) {
            console.error('Error al verificar skill del estudiante:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: error.message,
                code: 'VERIFY_STUDENT_SKILL_ERROR'
            });
        }
    }
};

export default studentSkillController;