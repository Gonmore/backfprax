import { Tutor, Scenter, Profamily } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function checkTutors() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión exitosa');

    console.log('Buscando profamilys disponibles...');
    const profamilys = await Profamily.findAll();
    console.log('Número de profamilys encontrados:', profamilys.length);
    if (profamilys.length > 0) {
      console.log('Profamilys:', profamilys.map(p => ({ id: p.id, name: p.name })).slice(0, 5));
    }

    console.log('Buscando tutores...');
    const tutors = await Tutor.findAll({
      include: [
        { model: Scenter, attributes: ['id', 'name', 'city'] },
        { model: Profamily, attributes: ['id', 'name', 'description'] }
      ]
    });

    console.log('Número de tutores encontrados:', tutors.length);
    if (tutors.length > 0) {
      console.log('Primer tutor:', JSON.stringify(tutors[0], null, 2));
    } else {
      console.log('No hay tutores. Creando tutores de prueba...');

      if (profamilys.length > 0) {
        // Crear tutores de prueba
        const sampleTutors = [
          {
            id: 'TUTOR001',
            name: 'María García López',
            email: 'maria.garcia@ip-valencia.edu',
            grade: 'Ingeniería Informática',
            degree: 'Grado Superior',
            tutorId: 4, // Instituto Profesional Valencia
            profamilyId: profamilys[0].id
          },
          {
            id: 'TUTOR002',
            name: 'Carlos Rodríguez Martínez',
            email: 'carlos.rodriguez@ip-valencia.edu',
            grade: 'Administración y Finanzas',
            degree: 'Grado Medio',
            tutorId: 4,
            profamilyId: profamilys.length > 1 ? profamilys[1].id : profamilys[0].id
          },
          {
            id: 'TUTOR003',
            name: 'Ana Fernández Sánchez',
            email: 'ana.fernandez@ip-valencia.edu',
            grade: 'Turismo',
            degree: 'Grado Superior',
            tutorId: 4,
            profamilyId: profamilys.length > 2 ? profamilys[2].id : profamilys[0].id
          }
        ];

        for (const tutorData of sampleTutors) {
          try {
            await Tutor.create(tutorData);
            console.log(`Tutor ${tutorData.name} creado exitosamente`);
          } catch (createError) {
            console.error(`Error creando tutor ${tutorData.name}:`, createError.message);
          }
        }

        console.log('Verificando tutores creados...');
        const newTutors = await Tutor.findAll({
          where: { tutorId: 4 },
          include: [
            { model: Scenter, attributes: ['id', 'name', 'city'] },
            { model: Profamily, attributes: ['id', 'name', 'description'] }
          ]
        });

        console.log('Número de tutores después de crear:', newTutors.length);
        if (newTutors.length > 0) {
          console.log('Tutores creados:', newTutors.map(t => ({
            id: t.id,
            name: t.name,
            email: t.email,
            scenter: t.scenter?.name,
            profamily: t.profamily?.name
          })));
        }
      } else {
        console.log('No hay profamilys disponibles para crear tutores');
      }
    }

  } catch (error) {
    console.error('Error:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

checkTutors();