import { Tutor, Scenter, Profamily } from './src/models/relations.js';

async function testEndpoint() {
  try {
    const tutors = await Tutor.findAll({
      where: { tutorId: 4 },
      include: [
        { model: Scenter, attributes: ['id', 'name', 'city'] },
        { model: Profamily, attributes: ['id', 'name', 'description'] }
      ]
    });

    console.log('API Response simulation:');
    console.log(JSON.stringify({
      success: true,
      data: tutors.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        grade: t.grade,
        degree: t.degree,
        tutorId: t.tutorId,
        profamilyId: t.profamilyId,
        scenter: t.scenter ? {
          id: t.scenter.id,
          name: t.scenter.name,
          city: t.scenter.city
        } : null,
        profamily: t.profamily ? {
          id: t.profamily.id,
          name: t.profamily.name,
          description: t.profamily.description
        } : null
      }))
    }, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testEndpoint();