import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'
import { TokenService } from '../services/tokenService.js';
import * as companyService from '../services/companyService.js'; // 🔥 AGREGAR ESTA LÍNEA
import { Student, User, Profamily, UserCompany, Company, RevealedCV, Application, Offer, Skill, StudentSkill, Scenter, Cv } from '../models/relations.js';
import { AffinityCalculator } from '../services/affinityCalculator.js';
import { Op } from 'sequelize';



async function getStudent(req, res) {
    const { userId } = req.user;
    console.log(userId)
    try {
        const student = await Student.findOne({
            where: {
                userId:userId,
            },
        });
        res.json(student);

    }catch(err){
        logger.error('Error getStudent: '+err);
        res.status(500).json({message: 'Server error getting Sdudent'})
    }
}

async function createStudent(req, res){
    const { userId } = req.user;
    const { grade, course, car, description, disp, photo } = req.body;
    
        
    try {
        await sequelize.transaction(async (t) => {
            await Student.update(
                { status: Status.INACTIVE },
                {
                    where: { userId: userId, status: Status.ACTIVE }, 
                    transaction: t 
                }
            );
            const student = await Student.create({
                userId:userId,
                grade: grade || null, // Opcional
                course: course || null, // Opcional
                car: car || false,
                description: description || '',
                photo: photo || null, // Foto opcional
                disp: disp || new Date().toISOString().split('T')[0], // Hoy por defecto si no se especifica
            },
            { tansaction: t}
            );
            logger.info({ userId }, "Student created");
            res.json(student);
        })
    }catch(err){
        logger.error('Error createStudent: '+err);
        res.status(500).json({message: 'Server error creating student'})
    }
}

async function getPreference(req, res) {
    const { userId } = req.user;
    try {
        const preference = await Preference.findOne({
            where: {
                userId:userId,
            },
        });
        res.json(preference);

    }catch(err){
        logger.error('Error getPreference: '+err);
        res.status(500).json({message: 'Server error getting preference'})
    }
}

async function updateStudent(req, res) {
    const { userId } = req.user;
    const { grade, course, car, description, disp, photo } = req.body;
    
    // Preparar objeto de actualización solo con campos proporcionados
    const updateData = {};
    if (grade !== undefined) updateData.grade = grade;
    if (course !== undefined) updateData.course = course;
    if (car !== undefined) updateData.car = car;
    if (description !== undefined) updateData.description = description;
    if (disp !== undefined) updateData.disp = disp;
    if (photo !== undefined) updateData.photo = photo;
    
    try {
        const student = await Student.update(updateData, {where: {userId:userId}});
        if (student[0] === 0)
            return res.status(404).json({message: 'Student not found'});
        res.json(student);

    }catch(err){
        logger.error('Error updateStudent: '+err);
        res.status(500).json({message: 'Server error updating student'})
    }
}

async function activateInactivate(req, res) {
    const { userId }= req.user;
    const {id} = req.params;
    const {active} = req.body;
    try {
        if(!active)   return res.status(400).json({message:'Active is required'});
        
        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({message: 'student not found'});
        }
        if (student.active === active){
            return res
                .status(400).json({message: 'User already has this status'});
        }
    
        student.active = active;
        await student.save();
        res.json(student);
            
    }catch(error){
        logger.error('Error activateInactivate: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

async function deleteStudent(req,res){
    const { userId }= req.user;
    const {id} = req.params;

    try{
        const student = await Student.destroy({ done }, {where: { id, userId:userId } });
        //destroy no es recomendado
        if (student[0] === 0)
            return res.status(404).json({message: 'Student not found'});
        res.json(student);

    }catch(err){
        logger.error('Error deleteStudent: '+err);
        res.status(500).json({message: 'Server error'})
    }
  }

export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            raw: true,
            order: [['createdAt', 'DESC']]
        });

        const studentsWithData = [];
        for (const student of students) {
            const user = await User.findByPk(student.userId, { raw: true });
            const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
            
            if (user) {
                studentsWithData.push({
                    ...student,
                    User: {
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        phone: user.phone
                    },
                    Profamily: profamily ? {
                        id: profamily.id,
                        name: profamily.name
                    } : null
                });
            }
        }

        res.json(studentsWithData);
    } catch (error) {
        logger.error('Error getAllStudents:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

export const getCandidates = async (req, res) => {
  try {
    const students = await Student.findAll({
      raw: true,
      order: [['createdAt', 'DESC']]
    });

    const studentsWithData = [];
    for (const student of students) {
      const user = await User.findByPk(student.userId, { raw: true });
      const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
      
      if (user) {
        studentsWithData.push({
          ...student,
          User: {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone
          },
          Profamily: profamily ? {
            id: profamily.id,
            name: profamily.name
          } : null
        });
      }
    }

    console.log(`✅ Candidatos devueltos: ${studentsWithData.length}`);
    res.json(studentsWithData);
  } catch (error) {
    logger.error('Error getCandidates:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const searchIntelligentStudents = async (req, res) => {
  console.log('🚀 ===== FUNCIÓN searchIntelligentStudents EJECUTÁNDOSE =====');
  console.error('🚨🚨🚨 DEBUG BACKEND: searchIntelligentStudents called at', new Date().toISOString());
  try {
    console.log('🔍 ===== INICIANDO BÚSQUEDA INTELIGENTE =====');
    const { userId } = req.user;

    // 🔥 DEBUG: Ver qué llega del frontend
    console.log('🔍 REQUEST BODY completo:', JSON.stringify(req.body, null, 2));
    console.log('🔍 REQUEST PARAMS:', req.params);
    console.log('🔍 REQUEST QUERY:', req.query);

    const { offerId, skills, filters = {} } = req.body;

    console.log('🔍 Datos extraídos:');
    console.log('   - offerId:', offerId);
    console.log('   - skills:', skills);
    console.log('   - filters:', filters);
    console.log('   - filters.profamilyId:', filters.profamilyId);
    console.log('   - filters.profamilyId tipo:', typeof filters.profamilyId);
    console.log('   - filters.profamilyId valor parseado:', filters.profamilyId ? parseInt(filters.profamilyId) : 'NO EXISTE');

    console.error('🚨🚨🚨 DEBUG BACKEND: Filters received:', JSON.stringify(filters));
    console.error('🚨🚨🚨 DEBUG BACKEND: Skills received:', JSON.stringify(skills));

    // 🔥 MANEJAR AMBOS CASOS: offerId O skills
    if (!offerId && (!skills || skills.length === 0)) {
      console.log('❌ VALIDACIÓN FALLIDA: No hay offerId ni skills');
      return res.status(400).json({
        mensaje: 'Se requiere offerId o skills para la búsqueda',
        received: { offerId, skills, filters }
      });
    }

    console.log('✅ Validación inicial pasada');

    let companySkillsObject = {};
    let offerInfo = null;

    if (offerId) {
      // 🔥 CASO 1: Búsqueda por oferta específica
      console.log('📋 MODO: Búsqueda por oferta específica');

      console.log('🔍 Buscando oferta con ID:', offerId);
      try {
        const offer = await Offer.findByPk(offerId, {
          include: [{
            model: Skill,
            as: 'skills',
            through: { attributes: [] } // Excluir campos de la tabla intermedia
          },
          {
            model: Profamily,
            as: 'profamilys', // ✅ Corregido: usar plural como en la definición de relación
            through: { attributes: [] }
          }]
        });
        console.log('🔍 Resultado de búsqueda de oferta:', offer ? 'ENCONTRADA' : 'NO ENCONTRADA');

        if (!offer) {
          console.log('❌ OFERTA NO ENCONTRADA');
          return res.status(404).json({ mensaje: 'Oferta no encontrada' });
        }

        console.log(`📋 Oferta encontrada: "${offer.name}"`);
        // ELIMINADO: lógica de tag hardcodeado
        console.log(`🔗 Skills de la oferta (desde relación):`, offer.skills ? offer.skills.length : 0);

        if (offer.skills && offer.skills.length > 0) {
          console.log('🔍 Skills de la oferta profesionales:', offer.skills.map(s => s.name));

          offer.skills.forEach(skill => {
            companySkillsObject[skill.name.toLowerCase()] = 2; // nivel requerido (intermediate)
          });
        }

        offerInfo = {
          id: offer.id,
          name: offer.name,
          skills: Object.keys(companySkillsObject),
          profamilyId: offer.profamilys ? offer.profamilys[0]?.id : null // ✅ Corregido: usar plural
        };
      } catch (offerError) {
        console.error('❌ ERROR BUSCANDO OFERTA:', offerError);
        throw offerError;
      }

    } else {
      // 🔥 CASO 2: Búsqueda por skills generales
      console.log('📋 MODO: Búsqueda por skills generales');
      console.log('🔍 Skills recibidas:', skills);
      
      // 🔥 MANEJAR SKILLS COMO OBJETO O ARRAY
      if (Array.isArray(skills)) {
        // Si es array (formato original esperado)
        skills.forEach(skill => {
          const normalizedSkill = skill.toLowerCase().trim();
          companySkillsObject[normalizedSkill] = 2; // nivel requerido (intermediate)
        });
      } else if (typeof skills === 'object' && skills !== null) {
        // Si es objeto (formato actual del frontend: { 'skill name': level })
        Object.entries(skills).forEach(([skillName, level]) => {
          const normalizedSkill = skillName.toLowerCase().trim();
          const skillLevel = typeof level === 'number' ? level : 2; // usar el nivel del objeto o default 2
          companySkillsObject[normalizedSkill] = skillLevel;
        });
      } else {
        console.log('⚠️ Skills en formato no reconocido, usando skills vacías');
      }

      offerInfo = {
        id: null,
        name: 'Búsqueda general',
        skills: Object.keys(companySkillsObject)
      };
    }

    console.log('🏢 Skills finales para comparar:', companySkillsObject);

    // 🔥 OBTENER EMPRESA
    console.log('🔍 Buscando empresa para userId:', userId);
    let company;
    try {
      const userCompany = await UserCompany.findOne({
        where: { 
          userId: userId,
          isActive: true 
        },
        include: [{
          model: Company,
          as: 'company'
        }],
        raw: false
      });
      console.log('🔍 Resultado búsqueda empresa:', userCompany ? 'ENCONTRADA' : 'NO ENCONTRADA');

      if (!userCompany || !userCompany.company) {
        console.log('❌ EMPRESA NO ENCONTRADA O INACTIVA');
        return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
      }

      company = userCompany.company;
      console.log(`🏢 Empresa: ${company.name} (ID: ${company.id})`);
    } catch (companyError) {
      console.error('❌ ERROR BUSCANDO EMPRESA:', companyError);
      throw companyError;
    }

    // 🔥 OBTENER ESTUDIANTES QUE YA APLICARON
    let appliedStudentIds = [];
    
    if (offerId) {
      // Excluir solo los que aplicaron a esta oferta específica
      console.log('🔍 Buscando aplicaciones para oferta específica:', offerId);
      const existingApplications = await Application.findAll({
        where: { offerId: offerId },
        attributes: ['studentId'],
        raw: true
      });
      appliedStudentIds = existingApplications.map(app => app.studentId);
      console.log(`🚫 Estudiantes que ya aplicaron a esta oferta: ${appliedStudentIds.length}`);
    } else {
      // Excluir los que aplicaron a cualquier oferta de la empresa
      console.log('🔍 Buscando aplicaciones para empresa:', company.id);
      const existingApplications = await Application.findAll({
        include: [{
          model: Offer,
          as: 'offer',
          where: { companyId: company.id },
          attributes: []
        }],
        attributes: ['studentId'],
        raw: true
      });
      appliedStudentIds = existingApplications.map(app => app.studentId);
      console.log(`🚫 Estudiantes que ya aplicaron a la empresa: ${appliedStudentIds.length}`);
    }

    // Construir filtros
    const whereClause = { active: true };
    if (appliedStudentIds.length > 0) {
      whereClause.id = { [Op.notIn]: appliedStudentIds };
    }
    
    if (filters.profamilyId) whereClause.profamilyId = parseInt(filters.profamilyId);
    if (filters.grade) whereClause.grade = filters.grade;
    if (filters.car !== undefined) whereClause.car = filters.car;

    console.log('🔍 Filtros aplicados:', whereClause);
    console.error('🚨🚨🚨 DEBUG BACKEND: Where clause:', JSON.stringify(whereClause));
    console.error('🚨🚨🚨 DEBUG BACKEND: Applied student IDs:', appliedStudentIds);

    // Obtener estudiantes
    console.log('🔍 Buscando estudiantes candidatos...');
    console.error('🚨🚨🚨 DEBUG BACKEND: About to query students with whereClause:', JSON.stringify(whereClause));
    let students = [];
    try {
      students = await Student.findAll({
        where: whereClause,
        raw: true,
        order: [['createdAt', 'DESC']]
      });

      console.log(`📋 Estudiantes candidatos encontrados: ${students.length}`);
      console.error(`🚨🚨🚨 DEBUG BACKEND: Found ${students.length} students AFTER excluding ${appliedStudentIds.length} who already applied`);
      
      if (students.length === 0) {
        console.error('⚠️⚠️⚠️ NO STUDENTS FOUND! Possible reasons:');
        console.error('   - All students already applied to this offer');
        console.error('   - No active students in database');
        console.error('   - Filters too restrictive');
        console.error(`   - Excluded students: ${appliedStudentIds.length}`);
        console.error(`   - Where clause: ${JSON.stringify(whereClause)}`);
      }
    } catch (studentsError) {
      console.error('❌ ERROR BUSCANDO ESTUDIANTES:', studentsError);
      throw studentsError;
    }

    // 🔥 SI NO HAY SKILLS PARA COMPARAR, DEVOLVER ESTUDIANTES SIN AFINIDAD
    if (Object.keys(companySkillsObject).length === 0) {
      console.log('⚠️ No hay skills para comparar, devolviendo estudiantes sin afinidad');
      
      const studentsWithoutAffinity = [];
      for (const student of students) {
        const user = await User.findByPk(student.userId, { raw: true });
        const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
        
        if (user) {
          studentsWithoutAffinity.push({
            ...student,
            User: {
              id: user.id,
              name: user.name,
              surname: user.surname,
              email: user.email,
              phone: user.phone
            },
            Profamily: profamily ? {
              id: profamily.id,
              name: profamily.name
            } : null,
            affinity: {
              level: 'sin datos',
              score: 0,
              matches: 0,
              coverage: 0,
              matchingSkills: [],
              explanation: 'No hay habilidades definidas para comparar'
            },
            isNonCandidate: true
          });
        }
      }

      return res.json({
        students: studentsWithoutAffinity,
        offer: offerInfo,
        searchCriteria: {
          offerId: offerId || null,
          skills: skills || [],
          filters,
          totalFound: studentsWithoutAffinity.length,
          excludedCandidates: appliedStudentIds.length,
          searchType: offerId ? 'for_specific_offer' : 'general_search'
        }
      });
    }

    // 🔥 CALCULAR AFINIDAD
    console.log('🤖 Calculando afinidad real con AffinityCalculator...');
    const affinityCalculator = new AffinityCalculator();
    console.log('🤖 AffinityCalculator creado');

    const studentsWithAffinity = [];

    for (const student of students) {
      try {
        console.log(`🔍 Procesando estudiante ID: ${student.id}, UserID: ${student.userId}`);
        const user = await User.findByPk(student.userId, { raw: true });
        console.log(`🔍 Usuario encontrado: ${user ? user.email : 'NO ENCONTRADO'}`);
        
        const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
        console.log(`🔍 Profamily encontrado: ${profamily ? profamily.name : 'NINGUNO'}`);
        
        if (!user) continue;

        // 🔥 OBTENER SKILLS REALES DEL ESTUDIANTE DESDE CvSkill Y INFORMACIÓN ACADÉMICA
        const studentSkills = {};
        let studentProfamilyId = null;
        let studentScenterId = null;
        let academicVerificationStatus = 'unverified';

        try {
          // 🔥 OBTENER CV DEL ESTUDIANTE
          const studentCV = await Cv.findOne({
            where: { studentId: student.id },
            include: [
              {
                model: Skill,
                as: 'skills',
                through: {
                  attributes: ['proficiencyLevel', 'yearsOfExperience', 'isHighlighted', 'notes', 'addedAt']
                },
                required: false
              }
            ],
            attributes: ['id', 'academicBackground', 'academicVerificationStatus', 'summary']
          });

          if (studentCV) {
            console.log(`� CV encontrado para estudiante ${user.email}`);

            // 🔥 OBTENER SKILLS DEL CV
            if (studentCV.skills && studentCV.skills.length > 0) {
              console.log(`🎯 Skills del CV encontradas: ${studentCV.skills.length}`);

              // Mapear niveles de proficiency a números
              const levelMap = {
                'bajo': 1,
                'medio': 2,
                'alto': 3
              };

              studentCV.skills.forEach(skill => {
                const skillName = skill.name.toLowerCase().trim();
                const proficiencyLevel = skill.cv_skills.proficiencyLevel;
                const numericLevel = levelMap[proficiencyLevel] || 1; // default a 1 si no está mapeado

                studentSkills[skillName] = numericLevel;
                console.log(`   - ${skillName}: ${proficiencyLevel} (${numericLevel})`);
              });
            } else {
              console.log(`⚠️ No se encontraron skills en el CV`);
            }

            // 🔥 OBTENER INFORMACIÓN ACADÉMICA DEL CV
            if (studentCV.academicBackground) {
              const academicBg = studentCV.academicBackground;
              console.log(`📚 Academic Background encontrado:`, academicBg);

              // Extraer profamilyId y scenterId del academicBackground
              if (academicBg.profamily) {
                studentProfamilyId = parseInt(academicBg.profamily);
                console.log(`🎓 Profamily del estudiante extraído del CV: ${studentProfamilyId}`);
              }

              if (academicBg.scenter) {
                studentScenterId = parseInt(academicBg.scenter);
                console.log(`🏫 Scenter del estudiante extraído del CV: ${studentScenterId}`);
              }

              // Determinar estado de verificación académica
              if (studentCV.academicVerificationStatus === 'verified') {
                academicVerificationStatus = 'verified';
                console.log(`✅ Estudiante academicamente verificado`);
              } else {
                academicVerificationStatus = 'unverified';
                console.log(`❌ Estudiante no verificado academicamente`);
              }
            } else {
              console.log(`⚠️ No se encontró academicBackground en el CV`);
            }
          } else {
            console.log(`⚠️ No se encontró CV para el estudiante ${user.email}`);
          }
        } catch (skillError) {
          console.error(`❌ Error obteniendo skills/CV para estudiante ${student.id}:`, skillError);
          // Continuar sin skills si hay error
        }

        console.log(`👤 ${user.email} - skills procesados:`, studentSkills);
        console.log(`👤 ${user.email} - profamilyId: ${studentProfamilyId}, scenterId: ${studentScenterId}, verification: ${academicVerificationStatus}`);

                // 🔥 DETERMINAR PROFAMILYS REQUERIDOS
        let requiredProfamilyIds = [];
        
        if (offerId) {
          // Caso 1: Búsqueda por oferta específica - usar profamilys de la oferta
          requiredProfamilyIds = offer.profamilys.map(p => p.id);
          console.log(`🎯 Usando profamilys de la oferta: ${requiredProfamilyIds}`);
        } else if (filters.profamilyId) {
          // Caso 2: Búsqueda inteligente con filtro de profamily - usar el filtro como requerido
          requiredProfamilyIds = [parseInt(filters.profamilyId)];
          console.log(`🎯 Usando profamily del filtro: ${requiredProfamilyIds}`);
        } else {
          // Caso 3: Sin restricciones de profamily
          requiredProfamilyIds = [];
          console.log(`🎯 Sin restricciones de profamily`);
        }

        // 🔥 CALCULAR AFINIDAD REAL
        const affinity = affinityCalculator.calculateAffinity(
          companySkillsObject,
          studentSkills,
          {
            profamilyId: studentProfamilyId, // 🔥 USAR PROFAMILY DEL CV
            offerProfamilyIds: requiredProfamilyIds, // 🔥 USAR PROFAMILYS DETERMINADOS
            academicVerificationStatus: academicVerificationStatus // 🔥 PASAR ESTADO DE VERIFICACIÓN
          }
        );        console.log(`🎯 Afinidad calculada ${user.email}: ${affinity.level} (score: ${affinity.score}, matches: ${affinity.matches}, coverage: ${affinity.coverage}%)`);

        studentsWithAffinity.push({
          ...student,
          User: {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone
          },
          Profamily: profamily ? {
            id: profamily.id,
            name: profamily.name
          } : null,
          affinity: {
            level: affinity.level,
            score: affinity.score,
            matches: affinity.matches,
            coverage: affinity.coverage,
            matchingSkills: affinity.matchingSkills.map(ms => ms.skill),
            explanation: affinity.explanation,
            profamilyMatch: affinity.factors.profamilyAffinity.level,
            profamilyBonus: Math.round((affinity.factors.profamilyAffinity.score - 1) * 100)
          },
          isNonCandidate: true
        });
      } catch (studentError) {
        console.error(`❌ Error procesando estudiante ${student.id}:`, studentError);
        // Continuar con el siguiente estudiante
        continue;
      }
    }

    // Ordenar por afinidad
    studentsWithAffinity.sort((a, b) => {
      const levelOrder = { "sin datos": 0, "bajo": 1, "medio": 2, "alto": 3, "muy alto": 4 };
      if (levelOrder[a.affinity.level] !== levelOrder[b.affinity.level]) {
        return levelOrder[b.affinity.level] - levelOrder[a.affinity.level];
      }
      return b.affinity.score - a.affinity.score;
    });

    console.log(`✅ Candidatos con afinidad: ${studentsWithAffinity.length}`);
    console.error('🚨🚨🚨 DEBUG BACKEND: Returning students with affinity:', studentsWithAffinity.length);
    console.error('🚨🚨🚨 DEBUG BACKEND: Search criteria:', JSON.stringify({
      offerId: offerId || null,
      skills: skills || Object.keys(companySkillsObject),
      filters,
      totalFound: studentsWithAffinity.length,
      excludedCandidates: appliedStudentIds.length,
      searchType: offerId ? 'for_specific_offer' : 'general_search'
    }));
    
    res.json({
      students: studentsWithAffinity,
      offer: offerInfo,
      searchCriteria: {
        offerId: offerId || null,
        skills: skills || Object.keys(companySkillsObject),
        filters,
        totalFound: studentsWithAffinity.length,
        excludedCandidates: appliedStudentIds.length,
        searchType: offerId ? 'for_specific_offer' : 'general_search'
      }
    });

  } catch (error) {
    console.error('❌ Error en búsqueda inteligente:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id, { raw: true });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const user = await User.findByPk(student.userId, { raw: true });
    const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;

    const formattedStudent = {
      ...student,
      User: user ? {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone
      } : null,
      Profamily: profamily ? {
        id: profamily.id,
        name: profamily.name
      } : null
    };

    res.json(formattedStudent);
  } catch (error) {
    logger.error('Error getStudentById:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// AGREGAR esta función también antes del export default:

export const getTokenBalance = async (req, res) => {
  try {
    const { userId } = req.user;

    // Obtener empresa asociada al usuario
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    // Obtener balance de tokens usando TokenService
    const tokenData = await TokenService.getCompanyTokens(userCompany.company.id);

    res.json({
      balance: tokenData.available,
      used: tokenData.used,
      total: tokenData.total,
      companyId: userCompany.company.id,
      companyName: userCompany.company.name
    });

  } catch (error) {
    console.error('❌ Error obteniendo balance de tokens:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGAR estas funciones al final del archivo, antes del export default:

// 🔥 VER CV - GRATIS para candidatos normales, CON TOKENS para IA
export const viewStudentCV = async (req, res) => {
  try {
    const { userId } = req.user;
    const { studentId } = req.params;
    const { fromIntelligentSearch = false } = req.body;

    console.log(`📄 Solicitud CV - Estudiante: ${studentId}, Desde IA: ${fromIntelligentSearch}, Usuario: ${userId}`);

    // 🔥 OBTENER EMPRESA DEL USUARIO DIRECTAMENTE
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;
    console.log(`🏢 Empresa encontrada: ${company.name} (ID: ${company.id})`);
    
    let tokensUsed = 0;
    let wasAlreadyRevealed = false;
    let accessType = 'free';

    // 🔥 SI VIENE DE BÚSQUEDA INTELIGENTE, VERIFICAR Y COBRAR TOKENS
    if (fromIntelligentSearch) {
      console.log(`🤖 Búsqueda inteligente - Verificando tokens para empresa ${company.id}`);
      
      try {
        const tokenResult = await TokenService.useTokens(
          company.id,
          2, // Costo fijo: 2 tokens por CV
          'view_cv_ai',
          parseInt(studentId),
          `Ver CV completo del estudiante ${studentId} (Búsqueda Inteligente)`
        );
        
        tokensUsed = tokenResult.wasAlreadyRevealed ? 0 : 2;
        wasAlreadyRevealed = tokenResult.wasAlreadyRevealed;
        accessType = wasAlreadyRevealed ? 'previously_revealed' : 'paid';
        
        console.log(`💳 Resultado tokens: ${tokenResult.message || 'Tokens procesados correctamente'}`);
        
      } catch (error) {
        if (error.message === 'Tokens insuficientes') {
          return res.status(402).json({
            code: 'INSUFFICIENT_TOKENS',
            mensaje: 'Tokens insuficientes para ver el CV',
            required: 2,
            action: 'view_cv'
          });
        }
        throw error;
      }
    } else {
      console.log(`✅ Acceso gratuito - Candidato aplicó directamente`);
      accessType = 'free';
    }

    // 🔥 MARCAR AUTOMÁTICAMENTE TODAS LAS APLICACIONES COMO "CV REVISADO"
    try {
      // First find applications that need to be updated
      const applicationsToUpdate = await Application.findAll({
        where: {
          studentId: parseInt(studentId),
          status: 'pending',
          reviewedAt: null
        },
        include: [{
          model: Offer,
          as: 'offer',
          where: { companyId: company.id },
          required: true,
          attributes: [] // We don't need offer data, just the join
        }]
      });

      if (applicationsToUpdate.length > 0) {
        // Update each application
        const updatePromises = applicationsToUpdate.map(app =>
          app.update({
            reviewedAt: new Date(),
            status: 'reviewed'
          })
        );

        await Promise.all(updatePromises);
        console.log(`✅ Marcadas ${applicationsToUpdate.length} aplicaciones como "CV revisado" para estudiante ${studentId}`);
      }
    } catch (updateError) {
      console.error('⚠️ Error actualizando aplicaciones a "revisado":', updateError);
      // No fallar la operación principal por este error
    }

    // 🔥 OBTENER DATOS COMPLETOS DEL ESTUDIANTE
    console.log(`🔍 Buscando estudiante con ID: ${studentId}`);
    const student = await Student.findByPk(studentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email', 'phone', 'description']
        },
        {
          model: Profamily,
          as: 'profamily',
          attributes: ['id', 'name', 'description'],
          required: false
        },
        {
          model: Cv,
          as: 'cv',
          attributes: ['id', 'academicBackground', 'academicVerificationStatus', 'summary'],
          required: false,
          include: [
            {
              model: Skill,
              as: 'skills',
              through: {
                attributes: ['proficiencyLevel', 'yearsOfExperience', 'isHighlighted', 'notes', 'addedAt']
              },
              required: false
            }
          ]
        }
      ]
    });

    console.log(`🔍 Resultado búsqueda estudiante:`, student ? 'ENCONTRADO' : 'NO ENCONTRADO');
    
    if (!student) {
      console.log(`❌ Estudiante ${studentId} no encontrado`);
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    console.log(`👤 Datos del estudiante:`, {
      id: student.id,
      grade: student.grade,
      course: student.course,
      car: student.car,
      tag: student.tag,
      description: student.description,
      hasUser: !!student.user,
      hasProfamily: !!student.profamily,
      hasCv: !!student.cv,
      cvId: student.cv?.id
    });

    // 🔥 OBTENER INFORMACIÓN ACADÉMICA DEL CV
    let academicInfo = null;
    if (student.cv?.academicBackground) {
      const academicBg = student.cv.academicBackground;
      console.log(`📚 Academic Background encontrado:`, academicBg);
      
      // Buscar información del scenter y profamily
      let scenterInfo = null;
      let profamilyInfo = null;
      
      if (academicBg.scenter) {
        try {
          scenterInfo = await Scenter.findByPk(academicBg.scenter, {
            attributes: ['id', 'name', 'code', 'city']
          });
          console.log(`🏫 Scenter encontrado:`, scenterInfo?.name);
        } catch (error) {
          console.error(`❌ Error obteniendo scenter ${academicBg.scenter}:`, error);
        }
      }
      
      if (academicBg.profamily) {
        try {
          profamilyInfo = await Profamily.findByPk(academicBg.profamily, {
            attributes: ['id', 'name', 'description']
          });
          console.log(`🎓 Profamily encontrado:`, profamilyInfo?.name);
        } catch (error) {
          console.error(`❌ Error obteniendo profamily ${academicBg.profamily}:`, error);
        }
      }
      
      academicInfo = {
        scenter: scenterInfo ? {
          id: scenterInfo.id,
          name: scenterInfo.name,
          code: scenterInfo.code,
          city: scenterInfo.city
        } : null,
        profamily: profamilyInfo ? {
          id: profamilyInfo.id,
          name: profamilyInfo.name,
          description: profamilyInfo.description
        } : null,
        status: academicBg.status || null,
        verificationStatus: student.cv.academicVerificationStatus || 'unverified'
      };
    } else {
      console.log(`⚠️ No se encontró academicBackground en el CV`);
    }

    // 🔥 OBTENER SKILLS REALES DEL CV
    const cvSkills = [];
    if (student.cv?.skills && student.cv.skills.length > 0) {
      console.log(`🎯 Skills del CV encontradas: ${student.cv.skills.length}`);
      
      student.cv.skills.forEach(skill => {
        cvSkills.push({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          proficiencyLevel: skill.cv_skills.proficiencyLevel,
          yearsOfExperience: skill.cv_skills.yearsOfExperience,
          isHighlighted: skill.cv_skills.isHighlighted,
          notes: skill.cv_skills.notes,
          addedAt: skill.cv_skills.addedAt
        });
        console.log(`   - ${skill.name} (${skill.cv_skills.proficiencyLevel})`);
      });
    } else {
      console.log(`⚠️ No se encontraron skills en el CV`);
    }

    // 🔥 PREPARAR RESPUESTA COMPLETA
    const responseData = {
      student: {
        id: student.id,
        grade: student.grade,
        course: student.course,
        car: student.car,
        tag: student.tag,
        description: student.description,
        User: student.user,
        profamily: student.profamily,
        skills: cvSkills, // 🔥 USAR SKILLS DEL CV
        academicInfo: academicInfo // 🔥 AGREGAR INFORMACIÓN ACADÉMICA
      },
      cv: {
        education: academicInfo ? 
          `${academicInfo.profamily?.name || 'Carrera no especificada'} - ${academicInfo.scenter?.name || 'Centro no especificado'} (${academicInfo.status || 'Estado no especificado'}) [${academicInfo.verificationStatus}]` :
          'Información académica no disponible',
        skills: cvSkills.map(skill => `${skill.name} (${skill.proficiencyLevel})`),
        hasVehicle: student.car,
        availability: student.disp,
        description: student.cv?.summary || student.description || 'Sin descripción adicional',
        academicBackground: academicInfo
      },
      access: {
        type: accessType,
        tokensUsed: tokensUsed,
        wasAlreadyRevealed: wasAlreadyRevealed,
        message: wasAlreadyRevealed ? 'CV ya revelado previamente' : 
                fromIntelligentSearch ? `CV revelado usando ${tokensUsed} tokens` : 
                'Acceso gratuito por aplicación directa'
      },
      // 🔥 MANTENER COMPATIBILIDAD CON FRONTEND EXISTENTE
      accessType: accessType,
      tokensUsed: tokensUsed,
      wasAlreadyRevealed: wasAlreadyRevealed,
      // 🔥 AGREGAR INFO DE APLICACIONES ACTUALIZADAS
      applicationsUpdated: true,
      message: 'CV visto exitosamente. Aplicaciones marcadas como revisadas.'
    };

    console.log(`✅ CV enviado exitosamente. Tipo: ${accessType}, Tokens: ${tokensUsed}`);
    console.log(`📊 Respuesta final:`, {
      studentGrade: responseData.student.grade,
      studentCourse: responseData.student.course,
      academicInfo: responseData.student.academicInfo,
      skillsCount: responseData.student.skills.length
    });
    
    res.json(responseData);

  } catch (error) {
    console.error('❌ Error viendo CV:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGAR función para obtener CVs revelados:
export const getRevealedCVs = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Obtener empresa del usuario directamente
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;
    
    // Obtener todos los CVs revelados de esta empresa
    const revealedCVs = await RevealedCV.findAll({
      where: { companyId: company.id },
      attributes: ['studentId', 'tokensUsed', 'revealType', 'revealedAt'],
      order: [['revealedAt', 'DESC']]
    });

    const revealedStudentIds = revealedCVs.map(cv => cv.studentId);
    
    console.log(`📋 CVs revelados para empresa ${company.id}: ${revealedStudentIds.length} estudiantes`);
    
    res.json({
      revealedStudentIds: revealedStudentIds,
      details: revealedCVs,
      count: revealedStudentIds.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo CVs revelados:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getRevealedCVsWithDetails = async (req, res) => {
  try {
    const { userId } = req.user;

    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const revealedCVsData = await RevealedCV.findAll({
      where: { companyId: userCompany.company.id },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            { 
              model: User, 
              as: 'user', // Usar 'user' en lugar de 'User'
              attributes: ['id', 'name', 'surname', 'email', 'phone']
            },
            { 
              model: Profamily, 
              as: 'profamily',
              attributes: ['id', 'name'],
              required: false 
            }
          ]
        }
      ],
      order: [['revealedAt', 'DESC']]
    });

    const processedData = revealedCVsData.map(revealed => ({
      id: revealed.id,
      studentId: revealed.studentId,
      revealedAt: revealed.revealedAt,
      tokensUsed: revealed.tokensUsed,
      revealType: revealed.revealType,
      student: {
        id: revealed.student.id,
        grade: revealed.student.grade,
        course: revealed.student.course,
        car: revealed.student.car,
        tag: revealed.student.tag,
        description: revealed.student.description,
        active: revealed.student.active,
        user: revealed.student.user,
        profamily: revealed.student.profamily
      }
    }));

    res.json({
      revealedCVs: processedData,
      total: processedData.length,
      company: {
        id: userCompany.company.id,
        name: userCompany.company.name
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo CVs revelados con detalles:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const useTokens = async (req, res) => {
  try {
    const { userId } = req.user;
    const { action, studentId, amount } = req.body;

    // Mapeo de usuarios a empresas (temporal - debería venir de la relación UserCompany)
    const userCompanyMapping = {
      2: 1, 3: 2, 4: 3
    };

    const companyId = userCompanyMapping[userId];
    if (!companyId) {
      return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
    }

    // Definir costos por acción
    const costs = {
      'view_cv': 2,
      'contact_student': 3
    };

    const cost = amount || costs[action];
    if (!cost) {
      return res.status(400).json({ mensaje: 'Acción no válida' });
    }

    // Usar el TokenService para procesar la transacción
    const result = await TokenService.useTokens(
      companyId, 
      cost, 
      action, 
      studentId,
      `${action} - Estudiante ID: ${studentId}`
    );

    res.json({
      success: true,
      newBalance: result.newBalance,
      used: cost,
      action,
      wasAlreadyRevealed: result.wasAlreadyRevealed || false
    });

  } catch (error) {
    console.error('❌ Error useTokens:', error);
    
    if (error.message === 'Tokens insuficientes') {
      return res.status(400).json({ 
        mensaje: 'Tokens insuficientes',
        code: 'INSUFFICIENT_TOKENS'
      });
    }
    
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// AGREGAR esta función después de viewStudentCV:

// 🔥 CONTACTAR ESTUDIANTE - GRATIS si ya fue revelado, CON TOKENS si es la primera vez
export const contactStudent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { studentId } = req.params;
    const { fromIntelligentSearch = false, message = '', subject = '' } = req.body;

    console.log(`📞 Solicitud de contacto - Estudiante: ${studentId}, Desde IA: ${fromIntelligentSearch}`);

    // Obtener empresa
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;
    let wasAlreadyRevealed = false;
    let tokensUsed = 0;

    // 🔥 SI VIENE DE BÚSQUEDA INTELIGENTE, VERIFICAR SI YA FUE REVELADO
    if (fromIntelligentSearch) {
      try {
        const result = await TokenService.useTokens(
          company.id,
          2, // Mismo costo que ver CV (2 tokens por "revelar" estudiante)
          'contact_student_ai',
          studentId,
          `Contactar estudiante desde búsqueda inteligente - Estudiante ID: ${studentId}`
        );
        
        wasAlreadyRevealed = result.wasAlreadyRevealed;
        tokensUsed = wasAlreadyRevealed ? 0 : 2;
        
        if (wasAlreadyRevealed) {
          console.log(`✅ Estudiante ya fue revelado anteriormente - Contacto gratuito`);
        } else {
          console.log(`💳 Tokens cobrados: 2, Nuevo balance: ${result.newBalance}`);
        }
        
      } catch (error) {
        if (error.message === 'Tokens insuficientes') {
          return res.status(400).json({
            mensaje: 'Tokens insuficientes para contactar este estudiante',
            code: 'INSUFFICIENT_TOKENS',
            required: 2
          });
        }
        throw error;
      }
    } else {
      console.log(`🆓 Contacto GRATUITO desde lista de candidatos normales`);
    }

    // Obtener datos del estudiante
    const student = await Student.findByPk(studentId, { raw: true });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const user = await User.findByPk(student.userId, { raw: true });

    // TODO: Aquí agregar lógica para enviar notificación/email al estudiante
    // Por ahora solo registramos el contacto
    
    res.json({
      success: true,
      message: 'Contacto realizado exitosamente',
      student: {
        id: student.id,
        name: user ? `${user.name} ${user.surname}` : 'No disponible',
        email: user ? user.email : 'No disponible',
        phone: user ? user.phone : 'No disponible'
      },
      company: {
        id: company.id,
        name: company.name,
        email: company.email
      },
      contactData: {
        subject: subject || `Contacto desde ${company.name}`,
        message: message || 'La empresa está interesada en contactar contigo.',
        sentAt: new Date().toISOString()
      },
      accessType: fromIntelligentSearch ? (wasAlreadyRevealed ? 'previously_revealed' : 'paid') : 'free',
      tokensUsed: tokensUsed,
      wasAlreadyRevealed: wasAlreadyRevealed
    });

  } catch (error) {
    console.error('❌ Error contactando estudiante:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGAR esta función:

export const getRevealedCandidates = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log(`📋 Obteniendo candidatos con CVs revelados para usuario: ${userId}`);

    // Obtener empresa del usuario
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const companyId = userCompany.company.id;
    console.log(`🏢 Empresa encontrada: ${userCompany.company.name} (ID: ${companyId})`);

    // Obtener todos los CVs revelados por esta empresa
    const revealedCVs = await RevealedCV.findAll({
      where: { companyId: companyId },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'surname', 'email', 'phone']
            },
            {
              model: Profamily,
              as: 'profamily',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        }
      ],
      order: [['revealedAt', 'DESC']]
    });

    console.log(`✅ Encontrados ${revealedCVs.length} CVs revelados`);

    // Formatear datos para el frontend
    const students = revealedCVs.map(revealed => ({
      id: revealed.student.id,
      revealedAt: revealed.revealedAt,
      tokensUsed: revealed.tokensUsed,
      searchMethod: revealed.revealType,
      student: {
        id: revealed.student.id,
        grade: revealed.student.grade,
        course: revealed.student.course,
        car: revealed.student.car,
        tag: revealed.student.tag,
        description: revealed.student.description,
        User: revealed.student.user,
        profamily: revealed.student.profamily
      },
      // Verificar si el estudiante también tiene aplicaciones
      hasApplications: false, // Se puede mejorar con una query adicional
      revealInfo: {
        date: revealed.revealedAt,
        tokens: revealed.tokensUsed,
        method: revealed.revealType || 'intelligent_search'
      }
    }));

    // Calcular estadísticas
    const totalRevealed = students.length;
    const totalTokensSpent = revealedCVs.reduce((sum, revealed) => sum + (revealed.tokensUsed || 0), 0);
    const averageTokensPerReveal = totalRevealed > 0 ? Math.round(totalTokensSpent / totalRevealed * 10) / 10 : 0;

    const summary = {
      totalRevealed,
      totalTokensSpent,
      averageTokensPerReveal
    };

    console.log(`📊 Estadísticas: ${totalRevealed} revelados, ${totalTokensSpent} tokens gastados`);

    res.json({
      students,
      summary
    });

  } catch (error) {
    console.error('❌ Error getRevealedCandidates:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/student/skills:
 *   get:
 *     summary: Obtener skills del estudiante actual
 *     tags: [Student Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skills del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       proficiencyLevel:
 *                         type: string
 *                         enum: [beginner, intermediate, advanced, expert]
 *                       yearsOfExperience:
 *                         type: number
 */
export const getStudentSkills = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Buscar el estudiante
    const student = await Student.findOne({
      where: { userId },
      include: [{
        model: Skill,
        as: 'skills',
        through: {
          attributes: ['proficiencyLevel', 'yearsOfExperience', 'isVerified', 'notes', 'addedAt']
        }
      }]
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const formattedSkills = student.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      proficiencyLevel: skill.student_skills.proficiencyLevel,
      yearsOfExperience: skill.student_skills.yearsOfExperience,
      isVerified: skill.student_skills.isVerified,
      notes: skill.student_skills.notes,
      addedAt: skill.student_skills.addedAt
    }));

    res.json({
      skills: formattedSkills,
      totalSkills: formattedSkills.length
    });

  } catch (error) {
    console.error('❌ Error getStudentSkills:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/student/skills:
 *   post:
 *     summary: Agregar skills al perfil del estudiante
 *     tags: [Student Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skills
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - skillId
 *                     - proficiencyLevel
 *                   properties:
 *                     skillId:
 *                       type: integer
 *                     proficiencyLevel:
 *                       type: string
 *                       enum: [beginner, intermediate, advanced, expert]
 *                     yearsOfExperience:
 *                       type: number
 *                       minimum: 0
 *                     notes:
 *                       type: string
 */
export const addStudentSkills = async (req, res) => {
  try {
    const { userId } = req.user;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ mensaje: 'Se requiere un array de skills' });
    }

    // Buscar el estudiante
    const student = await Student.findOne({ where: { userId } });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    await sequelize.transaction(async (t) => {
      // Agregar cada skill
      for (const skillData of skills) {
        const { skillId, proficiencyLevel, yearsOfExperience = 0, notes } = skillData;

        // Verificar que la skill existe
        const skill = await Skill.findByPk(skillId, { transaction: t });
        if (!skill) {
          throw new Error(`Skill con ID ${skillId} no encontrada`);
        }

        // Verificar si ya existe la relación
        const existingRelation = await StudentSkill.findOne({
          where: { studentId: student.id, skillId },
          transaction: t
        });

        if (existingRelation) {
          // Actualizar si ya existe
          await existingRelation.update({
            proficiencyLevel,
            yearsOfExperience,
            notes,
            lastUpdated: new Date()
          }, { transaction: t });
        } else {
          // Crear nueva relación
          await StudentSkill.create({
            studentId: student.id,
            skillId,
            proficiencyLevel,
            yearsOfExperience,
            notes,
            isVerified: false
          }, { transaction: t });
        }
      }
    });

    // Obtener las skills actualizadas
    const updatedStudent = await Student.findOne({
      where: { userId },
      include: [{
        model: Skill,
        as: 'skills',
        through: {
          attributes: ['proficiencyLevel', 'yearsOfExperience', 'isVerified', 'notes']
        }
      }]
    });

    const formattedSkills = updatedStudent.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      proficiencyLevel: skill.student_skills.proficiencyLevel,
      yearsOfExperience: skill.student_skills.yearsOfExperience,
      isVerified: skill.student_skills.isVerified,
      notes: skill.student_skills.notes
    }));

    res.json({
      mensaje: 'Skills actualizadas exitosamente',
      skills: formattedSkills,
      totalSkills: formattedSkills.length
    });

  } catch (error) {
    console.error('❌ Error addStudentSkills:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/student/skills/{skillId}:
 *   delete:
 *     summary: Eliminar skill del perfil del estudiante
 *     tags: [Student Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill a eliminar
 *     responses:
 *       200:
 *         description: Skill eliminada exitosamente
 */
export const removeStudentSkill = async (req, res) => {
  try {
    const { userId } = req.user;
    const { skillId } = req.params;

    // Buscar el estudiante
    const student = await Student.findOne({ where: { userId } });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // Eliminar la relación
    const deleted = await StudentSkill.destroy({
      where: { 
        studentId: student.id, 
        skillId: parseInt(skillId) 
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ mensaje: 'Skill no encontrada en el perfil del estudiante' });
    }

    res.json({ mensaje: 'Skill eliminada exitosamente' });

  } catch (error) {
    console.error('❌ Error removeStudentSkill:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// 🔥 NUEVAS FUNCIONES PARA GESTIÓN DE PROFAMILY DEL ESTUDIANTE
export const getStudentProfamily = async (req, res) => {
  try {
    const { userId } = req.user;

    // Buscar el estudiante del usuario autenticado
    const student = await Student.findOne({
      where: { userId },
      include: [{
        model: Profamily,
        as: 'profamily',
        attributes: ['id', 'name', 'description'],
        required: false
      }]
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const response = {
      profamily: student.profamily ? {
        id: student.profamily.id,
        name: student.profamily.name,
        description: student.profamily.description
      } : null
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Error getStudentProfamily:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/student/profamily:
 *   put:
 *     summary: Actualizar la familia profesional del estudiante
 *     tags: [Student Profamily]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profamilyId:
 *                 type: integer
 *                 description: ID de la nueva familia profesional
 *             required:
 *               - profamilyId
 *     responses:
 *       200:
 *         description: Familia profesional actualizada exitosamente
 */
export const updateStudentProfamily = async (req, res) => {
  try {
    const { userId } = req.user;
    const { profamilyId } = req.body;

    // Validar que se proporcione profamilyId
    if (!profamilyId) {
      return res.status(400).json({ mensaje: 'Se requiere el ID de la familia profesional' });
    }

    // Verificar que el usuario autenticado sea el estudiante correcto
    const student = await Student.findOne({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // Actualizar la profamily del estudiante
    await student.update({ profamilyId: profamilyId });

    // Obtener la profamily actualizada
    const updatedStudent = await Student.findOne({
      where: { userId: userId },
      include: [{
        model: Profamily,
        as: 'profamily',
        attributes: ['id', 'name', 'description'],
        required: false
      }]
    });

    res.json({
      mensaje: 'Familia profesional actualizada exitosamente',
      profamily: updatedStudent.profamily ? {
        id: updatedStudent.profamily.id,
        name: updatedStudent.profamily.name,
        description: updatedStudent.profamily.description
      } : null
    });

  } catch (error) {
    console.error('❌ Error updateStudentProfamily:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// 🔥 NUEVAS FUNCIONES PARA GESTIÓN DE SCENTER DEL ESTUDIANTE
export const getStudentScenter = async (req, res) => {
  try {
    const { userId } = req.user;

    // Buscar el estudiante del usuario autenticado
    const student = await Student.findOne({
      where: { userId },
      include: [{
        model: Scenter,
        as: 'scenter',
        attributes: ['id', 'name', 'code', 'city'],
        required: false
      }]
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const response = {
      scenter: student.scenter ? {
        id: student.scenter.id,
        name: student.scenter.name,
        code: student.scenter.code,
        city: student.scenter.city
      } : null
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Error getStudentScenter:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/student/scenter:
 *   put:
 *     summary: Actualizar el centro de estudios del estudiante
 *     tags: [Student Scenter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenterId:
 *                 type: integer
 *                 description: ID del nuevo centro de estudios (puede ser null para quitar la asociación)
 *     responses:
 *       200:
 *         description: Centro de estudios actualizado exitosamente
 */
export const updateStudentScenter = async (req, res) => {
  try {
    const { userId } = req.user;
    const { scenterId } = req.body;

    // Validar que se proporcione scenterId (puede ser null para quitar la asociación)
    if (scenterId === undefined) {
      return res.status(400).json({ mensaje: 'Se requiere el campo scenterId (puede ser null)' });
    }

    // Verificar que el usuario autenticado sea el estudiante correcto
    const student = await Student.findOne({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // Nota: La relación Student-Scenter no está implementada en el modelo actual
    // Esta función requiere actualizar el modelo Student para incluir scenterId
    return res.status(501).json({ mensaje: 'Funcionalidad no implementada: relación Student-Scenter no definida' });

  } catch (error) {
    console.error('❌ Error updateStudentScenter:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/student/professional-profile:
 *   put:
 *     summary: Actualizar el perfil profesional completo del estudiante (familia profesional, centro de estudios y estado de graduación)
 *     tags: [Student Professional Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profamilyId:
 *                 type: integer
 *                 description: ID de la familia profesional
 *               scenterId:
 *                 type: integer
 *                 description: ID del centro de estudios (puede ser null)
 *               graduationStatus:
 *                 type: string
 *                 enum: [por_egresar, egresado, titulado]
 *                 description: Estado de graduación
 *             required:
 *               - profamilyId
 *               - graduationStatus
 *     responses:
 *       200:
 *         description: Perfil profesional actualizado exitosamente
 */
export const updateStudentProfessionalProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { profamilyId, scenterId, graduationStatus } = req.body;

    // Validar campos requeridos
    if (!profamilyId) {
      return res.status(400).json({ mensaje: 'Se requiere el ID de la familia profesional' });
    }
    if (!graduationStatus || !['por_egresar', 'egresado', 'titulado'].includes(graduationStatus)) {
      return res.status(400).json({ mensaje: 'Se requiere un estado de graduación válido' });
    }
    if (scenterId === undefined) {
      return res.status(400).json({ mensaje: 'Se requiere el campo scenterId (puede ser null)' });
    }

    // Verificar que el usuario autenticado sea el estudiante correcto
    const student = await Student.findOne({
      where: { userId: userId }
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // Nota: Esta funcionalidad requiere actualizar el modelo Student para incluir campos profamilyId, scenterId, graduationStatus
    // y definir las asociaciones correspondientes en relations.js
    return res.status(501).json({ mensaje: 'Funcionalidad no implementada: campos y relaciones faltantes en el modelo Student' });

  } catch (error) {
    console.error('❌ Error updateStudentProfessionalProfile:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/student/professional-profile:
 *   get:
 *     summary: Obtener el perfil profesional completo del estudiante
 *     tags: [Student Professional Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil profesional obtenido exitosamente
 */
export const getStudentProfessionalProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    // Verificar que el usuario autenticado sea el estudiante correcto
    const student = await Student.findOne({
      where: { userId: userId },
      include: [
        {
          model: Profamily,
          as: 'profamily',
          attributes: ['id', 'name', 'description'],
          required: false
        },
        {
          model: Scenter,
          as: 'scenter',
          attributes: ['id', 'name', 'code', 'city'],
          required: false
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const response = {
      professionalProfile: {
        profamily: student.profamily ? {
          id: student.profamily.id,
          name: student.profamily.name,
          description: student.profamily.description
        } : null,
        scenter: student.scenter ? {
          id: student.scenter.id,
          name: student.scenter.name,
          code: student.scenter.code,
          city: student.scenter.city
        } : null,
        graduationStatus: student.grade || null // Usando grade como aproximación
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Error getStudentProfessionalProfile:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const getCurrentStudent = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const student = await Student.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email', 'phone', 'address', 'description']
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const response = {
      id: student.id,
      grade: student.grade,
      course: student.course,
      car: student.car,
      tag: student.tag,
      description: student.description,
      active: student.active,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      user: student.user,
      profamily: null // No implementado
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error getCurrentStudent:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

async function uploadStudentPhoto(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        // Verificar que el estudiante pertenece al usuario autenticado
        const student = await Student.findOne({
            where: { id: id, userId: userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // Por ahora, guardamos la foto como base64
        // En el futuro se puede mejorar con multer y almacenamiento en archivos
        const photo = req.body.photo; // Esperamos que venga como base64

        if (!photo) {
            return res.status(400).json({ message: 'No se proporcionó foto' });
        }

        // Actualizar la foto del estudiante
        await Student.update(
            { photo: photo },
            { where: { id: id, userId: userId } }
        );

        logger.info({ userId, studentId: id }, "Student photo updated");

        // Devolver el estudiante actualizado
        const updatedStudent = await Student.findOne({
            where: { id: id, userId: userId }
        });

        res.json(updatedStudent);

    } catch (err) {
        logger.error('Error uploadStudentPhoto: ' + err);
        res.status(500).json({ message: 'Server error uploading student photo' });
    }
}

export default {
    getStudent,
    createStudent,
    updateStudent,
    activateInactivate,
    deleteStudent,
    getAllStudents,
    getCandidates,
    searchIntelligentStudents,
    getStudentById,
    getCurrentStudent,
    getTokenBalance,
    useTokens,
    viewStudentCV,
    contactStudent,
    getRevealedCVs,
    getRevealedCandidates,
    getStudentSkills,
    addStudentSkills,
    removeStudentSkill,
    getStudentProfamily,
    updateStudentProfamily,
    getStudentScenter,
    updateStudentScenter,
    getStudentProfessionalProfile,
    updateStudentProfessionalProfile,
    uploadStudentPhoto
    //getRevealedCVsWithDetails  // 🔥 AGREGAR
}

