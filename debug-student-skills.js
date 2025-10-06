import { Student, Skill, Cv } from './src/models/relations.js';

async function debugStudentSkills() {
  try {
    const student = await Student.findOne({
      where: { userId: 12 }, // Sofía Pérez Müller - User ID 12
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

    console.log('Student found:', !!student);
    if (student) {
      console.log('Student ID:', student.id);
      console.log('User ID:', student.userId);
      console.log('Skills count:', student.skills ? student.skills.length : 0);
      console.log('Skills data:', student.skills);

      // Convertir como en el controller
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
          console.log('Processing skill:', skill.name, 'proficiencyLevel:', proficiencyLevel);
        });
      }
      console.log('Converted studentSkills:', studentSkills);

      // Verificar profamily
      let studentProfamilyId = null;
      if (student.cv?.academicBackground) {
        try {
          const academicBg = student.cv.academicBackground;
          if (academicBg.profamily) {
            studentProfamilyId = parseInt(academicBg.profamily);
          }
        } catch (error) {
          console.error('❌ Error extrayendo profamily del CV:', error);
        }
      }
      console.log('Student profamily ID:', studentProfamilyId);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

debugStudentSkills();