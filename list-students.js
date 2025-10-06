import { User, Student } from './src/models/relations.js';

async function listStudents() {
  try {
    const users = await User.findAll({
      where: {
        role: 'student'
      },
      include: [{
        model: Student,
        as: 'student'
      }],
      limit: 10
    });

    console.log('Students found:');
    users.forEach(user => {
      console.log(`- ${user.name} ${user.surname} (User ID: ${user.id}, Student ID: ${user.student ? user.student.id : 'No student'})`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

listStudents();