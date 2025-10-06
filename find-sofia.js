import { User, Student } from './src/models/relations.js';

async function findSofia() {
  try {
    const user = await User.findOne({
      where: {
        name: 'Sofía',
        surname: 'Pérez'
      },
      include: [{
        model: Student,
        as: 'student'
      }]
    });

    if (user) {
      console.log('User ID:', user.id);
      console.log('Student ID:', user.student ? user.student.id : 'No student');
      console.log('Student data:', user.student);
    } else {
      console.log('Sofía Pérez not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

findSofia();