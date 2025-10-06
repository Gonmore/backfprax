import AffinityCalculator from './src/services/affinityCalculator.js';
import { Student, Skill, Cv, Offer, Profamily } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function debugControllerIssue() {
    try {
        console.log('🔍 DEBUGGING CONTROLLER ISSUE\n');

        // 1. Obtener estudiante Sofía
        const student = await Student.findOne({
            where: { id: 7 },
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

        // 2. Extraer profamily del CV
        let studentProfamilyId = null;
        if (student.cv?.academicBackground) {
            try {
                const academicBg = student.cv.academicBackground;
                if (academicBg.profamily) {
                    studentProfamilyId = parseInt(academicBg.profamily);
                    console.log(`🎓 Profamily del estudiante: ${studentProfamilyId}`);
                }
            } catch (error) {
                console.error('❌ Error extrayendo profamily del CV:', error);
            }
        }

        // 3. Convertir skills del estudiante
        const studentSkills = {};
        if (student.skills && student.skills.length > 0) {
            student.skills.forEach(skill => {
                const levelMap = {
                    'beginner': 1,
                    'intermediate': 2,
                    'advanced': 3,
                    'expert': 4
                };
                const proficiencyLevel = skill.StudentSkill?.proficiencyLevel || skill.student_skills?.proficiencyLevel || 'beginner';
                studentSkills[skill.name.toLowerCase()] = levelMap[proficiencyLevel] || 1;
            });
        }

        console.log(`👤 Skills del estudiante (${Object.keys(studentSkills).length}):`, studentSkills);

        // 4. Obtener oferta 1
        const offer = await Offer.findOne({
            where: { id: 1 },
            include: [
                {
                    model: Skill,
                    as: 'skills',
                    through: { attributes: [] }
                },
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        console.log('🏢 Oferta encontrada:', offer ? { id: offer.id, name: offer.name } : 'NO ENCONTRADA');

        // 5. Convertir skills de la oferta
        const offerSkills = {};
        if (offer.skills && offer.skills.length > 0) {
            offer.skills.forEach(skill => {
                offerSkills[skill.name.toLowerCase()] = 2; // Nivel por defecto
            });
        }

        const offerProfamilyIds = offer.profamilys ? offer.profamilys.map(p => p.id) : [];
        console.log(`🏢 Skills de oferta (${Object.keys(offerSkills).length}):`, offerSkills);
        console.log(`🏢 Profamilys de oferta:`, offerProfamilyIds);

        // 6. Calcular afinidad exactamente como lo hace el controller
        console.log('\n🔄 CALCULANDO AFINIDAD EXACTAMENTE COMO EL CONTROLLER...\n');

        const aptitude = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
            profamilyId: studentProfamilyId,
            offerProfamilyIds: offerProfamilyIds
        });

        console.log('✅ RESULTADO DE AFINIDAD:');
        console.log('   - Score:', aptitude.score);
        console.log('   - Level:', aptitude.level);
        console.log('   - Matches:', aptitude.matches);
        console.log('   - Coverage:', aptitude.coverage);
        console.log('   - Explanation:', aptitude.explanation);

        // 7. Simular el formateo del controller
        const formattedAptitude = Math.round(aptitude.score || 0);
        console.log('\n🎯 FORMATEO DEL CONTROLLER:');
        console.log('   - aptitude.score:', aptitude.score);
        console.log('   - Math.round(aptitude.score || 0):', formattedAptitude);

        // 8. Verificar si hay algún problema con los datos
        console.log('\n🔍 VERIFICACIÓN DE DATOS:');
        console.log('   - studentProfamilyId:', studentProfamilyId);
        console.log('   - offerProfamilyIds:', offerProfamilyIds);
        console.log('   - Exact match?', offerProfamilyIds.includes(studentProfamilyId));
        console.log('   - offerSkills count:', Object.keys(offerSkills).length);
        console.log('   - studentSkills count:', Object.keys(studentSkills).length);

        // 9. Comparar con cálculo directo
        console.log('\n🔄 COMPARACIÓN CON CÁLCULO DIRECTO:');
        const directResult = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
            profamilyId: studentProfamilyId,
            offerProfamilyIds: offerProfamilyIds
        });
        console.log('   - Direct result score:', directResult.score);

    } catch (error) {
        console.error('❌ ERROR EN DEBUG:', error);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

debugControllerIssue();