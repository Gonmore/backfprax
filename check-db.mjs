import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/ausbildung', {
  logging: false
});

async function checkData() {
  try {
    console.log('🔍 Verificando datos problemáticos...');

    // Ver qué profamilys existen
    const [profamilys] = await sequelize.query('SELECT id, name FROM profamilys ORDER BY id');
    console.log('📋 Profamilys existentes:', profamilys.length);
    profamilys.slice(0, 5).forEach(p => console.log('  ', p.id, p.name));
    if (profamilys.length > 5) console.log('  ... y', profamilys.length - 5, 'más');

    // Ver qué referencias problemáticas hay
    const [scenterProfamilys] = await sequelize.query('SELECT scenterId, profamilyId FROM scenter_profamilys WHERE profamilyId NOT IN (SELECT id FROM profamilys)');
    console.log('❌ Referencias problemáticas en scenter_profamilys:', scenterProfamilys.length);
    scenterProfamilys.forEach(sp => console.log('  scenterId:', sp.scenterid, 'profamilyId:', sp.profamilyid));

    // Ver qué profamilyId=43 debería ser
    const [missing43] = await sequelize.query('SELECT * FROM profamilys WHERE id = 43');
    console.log('🔍 Profamily con id=43 existe:', missing43.length > 0);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();