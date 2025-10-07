import sequelize from './src/database/database.js';
import { Offer, Student, Cv, Profamily } from './src/models/relations.js';

async function debug() {
    try {
        console.log('🔍 DEBUGGING PROFAMILY DETECTION\n');

        // 1. Buscar ofertas con profamily 1
        const offers = await Offer.findAll({
            include: [{
                model: Profamily,
                as: 'profamilys',
                where: { id: 1 },
                required: true
            }]
        });

        console.log('🏢 Ofertas que requieren profamily 1:', offers.length);
        offers.forEach(offer => {
            console.log('  -', offer.name, '(ID:', offer.id, ')');
        });

        // 2. Buscar estudiantes con profamily 1 en su CV
        const students = await Student.findAll({
            include: [{
                model: Cv,
                as: 'cv',
                where: {
                    academicBackground: {
                        profamily: 1
                    }
                },
                required: true
            }, {
                model: Cv,
                as: 'cv',
                required: false
            }]
        });

        console.log('\n🎓 Estudiantes con profamily 1 en CV:', students.length);
        for (const student of students) {
            const cv = student.cv;
            const academicBg = cv?.academicBackground;
            const verificationStatus = cv?.academicVerificationStatus || 'unverified';

            console.log('  -', student.id, ':', academicBg?.profamily,
                       '(verificado:', verificationStatus, ')');
        }

        // 3. Verificar cálculo de afinidad para primera oferta y estudiantes
        if (offers.length > 0 && students.length > 0) {
            console.log('\n🔄 Verificando cálculo de afinidad...');
            const offer = offers[0];
            const student = students[0];

            console.log('Oferta:', offer.name);
            console.log('Estudiante CV academicBackground:', JSON.stringify(student.cv?.academicBackground, null, 2));

            // Simular extracción como en el controller
            let studentProfamilyId = null;
            if (student.cv?.academicBackground) {
                const academicBg = student.cv.academicBackground;
                if (academicBg.profamily) {
                    studentProfamilyId = parseInt(academicBg.profamily);
                }
            }

            console.log('studentProfamilyId extraído:', studentProfamilyId);
            console.log('offer profamilys:', offer.profamilys.map(p => p.id));
            console.log('¿Coincide?', offer.profamilys.some(p => p.id === studentProfamilyId));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

debug();