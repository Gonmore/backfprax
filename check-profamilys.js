import sequelize from './src/database/database.js';
import { Student, Profamily } from './src/models/relations.js';

async function checkProfamilys() {
  try {
    const profamilys = await Profamily.findAll({ attributes: ['id', 'name'] });
    console.log('Profamilys disponibles:');
    profamilys.forEach(p => console.log(`  ${p.id}: ${p.name}`));

    const sofia = await Student.findOne({ where: { id: 7 }, attributes: ['id', 'profamilyId'] });
    console.log(`\nSofía profamilyId: ${sofia.profamilyId}`);

    // Si Sofía no tiene profamily, asignarle Marketing (ID 33)
    if (!sofia.profamilyId) {
      console.log('\n🔧 ASIGNANDO PROFAMILY MARKETING A SOFÍA...');
      await Student.update({ profamilyId: 33 }, { where: { id: 7 } });
      console.log('✅ Profamily asignada correctamente');
    }

  } catch(e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}

checkProfamilys();