import { Student, Skill, Cv, Offer } from './src/models/relations.js';

async function simulateController() {
  try {
    console.log('=== SIMULATING CONTROLLER LOGIC ===');

    // 1. Obtener estudiante (como en el controller)
    console.log('1. Getting student...');
    const student = await Student.findOne({
      where: { userId: 12 },
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

    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('✅ Student found:', student.id);

    // 2. Extraer profamily (como en el controller)
    console.log('2. Extracting profamily...');
    let studentProfamilyId = null;
    if (student.cv?.academicBackground) {
      try {
        const academicBg = student.cv.academicBackground;
        if (academicBg.profamily) {
          studentProfamilyId = parseInt(academicBg.profamily);
        }
      } catch (error) {
        console.error('❌ Error extracting profamily:', error);
      }
    }
    console.log('✅ Student profamily ID:', studentProfamilyId);

    // 3. Convertir skills del estudiante (como en el controller)
    console.log('3. Converting student skills...');
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
    console.log('✅ Student skills converted:', Object.keys(studentSkills).length, 'skills');

    // 4. Obtener ofertas (como en el controller)
    console.log('4. Getting offers...');
    const offers = await Offer.findAll({
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 3 // Solo las primeras 3 para testing
    });

    console.log('✅ Found', offers.length, 'offers');

    // 5. Procesar cada oferta (como en el controller)
    for (const offer of offers) {
      console.log(`\n=== PROCESSING OFFER: ${offer.name} (ID: ${offer.id}) ===`);

      // Convertir skills de la oferta
      const offerSkills = {};
      if (offer.skills && offer.skills.length > 0) {
        offer.skills.forEach(skill => {
          offerSkills[skill.name.toLowerCase()] = 2;
        });
      }
      console.log('Offer skills:', Object.keys(offerSkills).length, 'skills');

      // Verificar condición
      const canCalculate = Object.keys(offerSkills).length > 0 && Object.keys(studentSkills).length > 0;
      console.log('Can calculate affinity:', canCalculate);

      if (canCalculate) {
        console.log('🔍 DEBUG: offerSkills:', Object.keys(offerSkills));
        console.log('🔍 DEBUG: studentSkills:', Object.keys(studentSkills));
        console.log('🔍 DEBUG: profamily data:', { profamilyId: studentProfamilyId, offerProfamilyIds: [] });

        // Importar y calcular
        const affinityCalculator = (await import('./src/services/affinityCalculator.js')).default;
        const result = affinityCalculator.calculateAffinity(offerSkills, studentSkills, {
          profamilyId: studentProfamilyId,
          offerProfamilyIds: []
        });

        console.log('✅ RESULT:', result);
      } else {
        console.log('❌ Cannot calculate - missing skills');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit(0);
}

simulateController();