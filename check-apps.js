import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

async function createTestInterview() {
  try {
    // Primero obtener una aplicación existente
    const applications = await sequelize.query('SELECT id, status, "interviewDetails" FROM applications LIMIT 1', {
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('Resultado de la consulta:', applications);
    console.log('Tipo:', typeof applications);
    console.log('Longitud:', applications.length);

    if (!applications || applications.length === 0) {
      console.log('No hay aplicaciones en la base de datos');
      return;
    }

    const app = applications[0];
    console.log('Aplicación encontrada:', app);

    const appId = app.id;
    console.log(`Actualizando aplicación ${appId} con entrevista solicitada`);

    // Crear detalles de entrevista de prueba
    const interviewDetails = {
      date: '2025-10-15',
      time: '14:30',
      location: 'Oficina Central, Calle Principal 123',
      type: 'remoto',
      link: 'https://meet.google.com/abc-defg-hij',
      notes: 'Entrevista técnica para desarrollador frontend'
    };

    const interviewDetailsString = JSON.stringify(interviewDetails);

    // Actualizar la aplicación
    await sequelize.query(
      'UPDATE applications SET status = $1, "interviewDetails" = $2, "interviewRequestedAt" = NOW(), "companyNotes" = $3 WHERE id = $4',
      {
        bind: [
          'interview_requested',
          interviewDetailsString,
          'Entrevista solicitada para el 15 de octubre a las 14:30',
          appId
        ]
      }
    );

    console.log('✅ Aplicación actualizada con entrevista solicitada');
    console.log('Detalles de entrevista:', interviewDetails);

    // Verificar que se guardó correctamente
    const updatedApps = await sequelize.query('SELECT id, status, "interviewDetails", "interviewRequestedAt" FROM applications WHERE id = $1', {
      bind: [appId],
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('Resultado de verificación:', updatedApps);

    if (updatedApps && updatedApps.length > 0) {
      const app = updatedApps[0];
      console.log('✅ Verificación:');
      console.log(`ID: ${app.id}`);
      console.log(`Status: ${app.status}`);
      console.log(`InterviewDetails raw: ${app.interviewDetails}`);
      try {
        const parsed = JSON.parse(app.interviewDetails);
        console.log(`InterviewDetails parsed:`, parsed);
      } catch (parseError) {
        console.error('Error parsing interviewDetails:', parseError);
      }
      console.log(`RequestedAt: ${app.interviewRequestedAt}`);
    } else {
      console.log('❌ No se pudo verificar la aplicación actualizada');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

createTestInterview();