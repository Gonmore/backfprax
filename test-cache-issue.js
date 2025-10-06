import AffinityCalculator from './src/services/affinityCalculator.js';
import { Student, Skill, Cv, Offer, Profamily } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function testCacheIssue() {
    try {
        console.log('🧹 TESTING CACHE ISSUE\n');

        // Limpiar cache
        console.log('🧹 Limpiando cache del AffinityCalculator...');
        AffinityCalculator.clearCache();

        // Obtener datos de prueba
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

        // Extraer datos
        let studentProfamilyId = null;
        if (student.cv?.academicBackground?.profamily) {
            studentProfamilyId = parseInt(student.cv.academicBackground.profamily);
        }

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

        const offerSkills = {};
        if (offer.skills && offer.skills.length > 0) {
            offer.skills.forEach(skill => {
                offerSkills[skill.name.toLowerCase()] = 2;
            });
        }

        const offerProfamilyIds = offer.profamilys ? offer.profamilys.map(p => p.id) : [];

        console.log('📊 DATOS DE PRUEBA:');
        console.log('   - Student profamily:', studentProfamilyId);
        console.log('   - Offer profamilys:', offerProfamilyIds);
        console.log('   - Student skills count:', Object.keys(studentSkills).length);
        console.log('   - Offer skills count:', Object.keys(offerSkills).length);

        // Probar múltiples cálculos
        console.log('\n🔄 REALIZANDO MÚLTIPLES CÁLCULOS...\n');

        for (let i = 0; i < 5; i++) {
            const result = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
                profamilyId: studentProfamilyId,
                offerProfamilyIds: offerProfamilyIds
            });

            console.log(`Cálculo ${i + 1}: Score = ${result.score}, Level = ${result.level}`);

            // Verificar cache stats
            const cacheStats = AffinityCalculator.getCacheStats();
            console.log(`   Cache: ${cacheStats.size}/${cacheStats.maxSize}, Hits: ${cacheStats.hits}, Misses: ${cacheStats.misses}`);
        }

        // Limpiar cache y probar de nuevo
        console.log('\n🧹 LIMPIANDO CACHE Y REPITIENDO...\n');
        AffinityCalculator.clearCache();

        for (let i = 0; i < 3; i++) {
            const result = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
                profamilyId: studentProfamilyId,
                offerProfamilyIds: offerProfamilyIds
            });

            console.log(`Cálculo ${i + 1} (post-clean): Score = ${result.score}, Level = ${result.level}`);
        }

        // Probar con datos ligeramente diferentes
        console.log('\n🔄 PROBANDO CON DATOS MODIFICADOS...\n');

        // Cambiar profamilyId
        const result1 = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
            profamilyId: 99, // Profamily que no existe
            offerProfamilyIds: offerProfamilyIds
        });
        console.log(`Con profamily 99: Score = ${result1.score}, Level = ${result1.level}`);

        // Sin profamily
        const result2 = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
            profamilyId: null,
            offerProfamilyIds: offerProfamilyIds
        });
        console.log(`Sin profamily: Score = ${result2.score}, Level = ${result2.level}`);

        // Sin offer profamilys
        const result3 = AffinityCalculator.calculateAffinity(offerSkills, studentSkills, {
            profamilyId: studentProfamilyId,
            offerProfamilyIds: []
        });
        console.log(`Sin offer profamilys: Score = ${result3.score}, Level = ${result3.level}`);

    } catch (error) {
        console.error('❌ ERROR:', error);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

testCacheIssue();