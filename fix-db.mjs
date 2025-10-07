import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Usar configuración por defecto (Railway)
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/ausbildung', {
  logging: console.log
});

async function fixDatabase() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    console.log('🔍 Verificando datos problemáticos...');

    // Ver qué referencias problemáticas hay
    const [problematicRefs] = await sequelize.query(`
      SELECT sp.scenterId, sp.profamilyId, sp.id
      FROM scenter_profamilys sp
      WHERE sp.profamilyId NOT IN (SELECT id FROM profamilys)
    `);

    console.log(`❌ Encontradas ${problematicRefs.length} referencias problemáticas:`);
    problematicRefs.forEach(ref => {
      console.log(`  scenterId: ${ref.scenterid}, profamilyId: ${ref.profamilyid}, id: ${ref.id}`);
    });

    if (problematicRefs.length > 0) {
      console.log('🧹 Eliminando referencias problemáticas...');

      // Eliminar las referencias problemáticas
      const idsToDelete = problematicRefs.map(ref => ref.id);
      await sequelize.query(`
        DELETE FROM scenter_profamilys
        WHERE id IN (${idsToDelete.join(',')})
      `);

      console.log(`✅ Eliminadas ${idsToDelete.length} referencias problemáticas`);
    }

    // Verificar que ahora no hay problemas
    const [remainingProblems] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM scenter_profamilys sp
      WHERE sp.profamilyId NOT IN (SELECT id FROM profamilys)
    `);

    console.log(`🔍 Problemas restantes: ${remainingProblems[0].count}`);

    if (remainingProblems[0].count === 0) {
      console.log('✅ Base de datos corregida. Ahora puedes iniciar la aplicación.');
    } else {
      console.log('❌ Aún hay problemas. Considera recrear la base de datos.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDatabase();