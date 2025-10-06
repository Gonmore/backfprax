import AffinityCalculator from './src/services/affinityCalculator.js';
import { Student, Skill, Cv, Offer, Profamily, Company, UserCompany } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function simulateGetOffersWithAptitude() {
    try {
        console.log('🎯 SIMULANDO getOffersWithAptitude EXACTAMENTE\n');

        // Simular req.user (usuario con ID 2)
        const reqUser = { userId: 2 };

        console.log(`🎯 Obteniendo ofertas con aptitud para usuario: ${reqUser.userId}`);
        console.log('🔍 req.user completo:', reqUser);

        // 1. Buscar el estudiante y sus skills Y CV (exactamente como en el controller)
        console.log('👤 Buscando estudiante...');
        const student = await Student.findOne({
            where: { userId: reqUser.userId },
            include: [
                {
                    model: Skill,
                    as: 'skills',
                    through: {
                        attributes: ['proficiencyLevel', 'yearsOfExperience']
                    }
                },
                {
                    model: Cv,
                    as: 'cv',
                    attributes: ['id', 'academicBackground'],
                    required: false
                }
            ]
        });

        console.log('👤 Estudiante encontrado:', student ? { id: student.id, userId: student.userId } : 'NO ENCONTRADO');

        if (!student) {
            console.log('❌ Estudiante no encontrado para userId:', reqUser.userId);
            return;
        }

        // 🔥 EXTRAER PROFAMILY DEL CV DEL ESTUDIANTE (exactamente como en el controller)
        let studentProfamilyId = null;
        if (student.cv?.academicBackground) {
            try {
                const academicBg = student.cv.academicBackground;
                if (academicBg.profamily) {
                    studentProfamilyId = parseInt(academicBg.profamily);
                    console.log(`🎓 Profamily del estudiante extraído del CV: ${studentProfamilyId}`);
                }
            } catch (error) {
                console.error('❌ Error extrayendo profamily del CV:', error);
            }
        } else {
            console.log('⚠️ Estudiante no tiene CV o academicBackground');
        }

        // 2. Convertir skills del estudiante al formato esperado por el calculador (exactamente como en el controller)
        console.log('🔄 Convirtiendo skills del estudiante...');
        const studentSkills = {};
        if (student.skills && student.skills.length > 0) {
            student.skills.forEach(skill => {
                // Convertir proficiencyLevel a número para el calculador
                const levelMap = {
                    'beginner': 1,
                    'intermediate': 2,
                    'advanced': 3,
                    'expert': 4
                };
                // Acceder correctamente a los atributos de la tabla intermedia
                const proficiencyLevel = skill.StudentSkill?.proficiencyLevel || skill.student_skills?.proficiencyLevel || 'beginner';
                studentSkills[skill.name.toLowerCase()] = levelMap[proficiencyLevel] || 1;
            });
        }

        console.log(`👤 Estudiante ${student.id} - Skills:`, studentSkills);

        // 3. Obtener todas las ofertas con sus skills (exactamente como en el controller)
        console.log('📋 Obteniendo ofertas de la base de datos...');
        const offers = await Offer.findAll({
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name', 'sector', 'city']
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
                    through: {
                        attributes: [] // OfferSkill table doesn't have level/required columns
                    }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`📋 Encontradas ${offers.length} ofertas`);
        console.log('🔍 Primera oferta (skills):', offers[0]?.skills);

        // 4. Calcular aptitud para cada oferta (exactamente como en el controller)
        console.log('🧮 Calculando aptitud para cada oferta...');
        const offersWithAptitude = [];

        for (const offer of offers) {
            try {
                console.log(`🔄 Procesando oferta: ${offer.name} (ID: ${offer.id})`);

                // Convertir skills de la oferta al formato esperado
                const offerSkills = {};
                if (offer.skills && offer.skills.length > 0) {
                    offer.skills.forEach(skill => {
                        // Since OfferSkill doesn't have level, use default level 2 (intermediate)
                        offerSkills[skill.name.toLowerCase()] = 2;
                    });
                }

                console.log(`🎯 Skills de oferta ${offer.name}:`, offerSkills);

                // 🔥 OBTENER PROFAMILY IDS DE LA OFERTA
                const offerProfamilyIds = offer.profamilys ? offer.profamilys.map(p => p.id) : [];
                console.log(`🏢 Profamilys de oferta ${offer.name}:`, offerProfamilyIds);

                // Calcular aptitud/afinidad
                let aptitude;
                if (Object.keys(offerSkills).length > 0 && Object.keys(studentSkills).length > 0) {
                    console.log(`🔍 DEBUG: Calculando afinidad para oferta "${offer.name}"`);
                    console.log(`🔍 DEBUG: offerSkills (${Object.keys(offerSkills).length}):`, offerSkills);
                    console.log(`🔍 DEBUG: studentSkills (${Object.keys(studentSkills).length}):`, studentSkills);
                    console.log(`🔍 DEBUG: profamily data:`, { profamilyId: studentProfamilyId, offerProfamilyIds: offerProfamilyIds });

                    aptitude = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
                        profamilyId: studentProfamilyId,
                        offerProfamilyIds: offerProfamilyIds
                    });

                    console.log(`✅ DEBUG: Resultado afinidad para "${offer.name}":`, aptitude);
                } else {
                    console.log(`❌ DEBUG: NO se puede calcular afinidad para "${offer.name}":`);
                    console.log(`   - offerSkills: ${Object.keys(offerSkills).length} skills`);
                    console.log(`   - studentSkills: ${Object.keys(studentSkills).length} skills`);
                    aptitude = {
                        level: 'sin datos',
                        score: 0,
                        matches: 0,
                        coverage: 0,
                        explanation: Object.keys(offerSkills).length === 0
                            ? 'Esta oferta no tiene skills específicos definidos'
                            : 'Necesitas agregar skills a tu perfil para ver tu compatibilidad'
                    };
                }

                // Formatear para el frontend (exactamente como en el controller)
                const formattedOffer = {
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
                    tag: offer.tag,
                    description: offer.description,
                    jobs: offer.jobs,
                    requisites: offer.requisites,
                    createdAt: offer.createdAt,
                    updatedAt: offer.updatedAt,
                    profamilyId: offer.profamilyId,
                    company: offer.company,
                    profamily: offer.profamilys && offer.profamilys.length > 0 ? offer.profamilys[0] : null,
                    skills: offer.skills.map(skill => ({
                        id: skill.id,
                        name: skill.name,
                        level: 2, // Default level since OfferSkill doesn't have level column
                        required: false // Default since OfferSkill doesn't have required column
                    })),
                    // 🔥 USAR SOLO EL SCORE COMO APTITUDE SIMPLE
                    aptitude: Math.round(aptitude.score || 0),
                    // 🔥 AGREGAR DETALLES DE APTITUD COMO PROPIEDADES SEPARADAS
                    aptitudeDetails: {
                        level: aptitude.level,
                        score: Math.round(aptitude.score * 10) / 10,
                        matches: aptitude.matches,
                        coverage: Math.round(aptitude.coverage || 0),
                        explanation: aptitude.explanation,
                        matchingSkills: aptitude.matchingSkills || []
                    }
                };

                offersWithAptitude.push(formattedOffer);
                console.log(`🎯 Oferta "${offer.name}" - Aptitud: ${aptitude.level} (${Math.round(aptitude.score || 0)}%)`);
            } catch (offerError) {
                console.error(`❌ Error procesando oferta ${offer.id} (${offer.name}):`, offerError);
                // Si hay error en una oferta específica, continuar con las demás
                continue;
            }
        }

        // 5. Ordenar por aptitud (mejores primero) (exactamente como en el controller)
        offersWithAptitude.sort((a, b) => {
            // Ordenar por score de aptitud (mayor a menor)
            if (a.aptitude !== b.aptitude) {
                return b.aptitude - a.aptitude;
            }
            // Si tienen el mismo score, ordenar por fecha de creación (más reciente primero)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        console.log(`✅ Retornando ${offersWithAptitude.length} ofertas con aptitud calculada`);

        // Mostrar resultados específicos para debugging
        console.log('\n📊 RESULTADOS ESPECÍFICOS:');
        offersWithAptitude.forEach(offer => {
            console.log(`   - ${offer.name}: aptitude = ${offer.aptitude}, level = ${offer.aptitudeDetails.level}, score = ${offer.aptitudeDetails.score}`);
        });

    } catch (error) {
        console.error('❌ Error simulateGetOffersWithAptitude:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error message:', error.message);
    } finally {
        await sequelize.close();
    }
}

simulateGetOffersWithAptitude();