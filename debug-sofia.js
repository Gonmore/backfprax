import { AffinityCalculator } from './src/services/affinityCalculator.js';
import sequelize from './src/database/database.js';
import { Student, Offer, Cv, User, Skill, Profamily, StudentSkill } from './src/models/relations.js';

async function investigateSofiaAffinity() {
  try {
    console.log('🔍 INVESTIGACIÓN: Sofía Pérez vs Oferta 1\n');

    // Obtener la oferta 1
    const offer = await Offer.findOne({
      where: { id: 1 },
      include: [
        { model: Skill, as: 'skills' },
        { model: Profamily, as: 'profamilys' }
      ]
    });

    if (!offer) {
      console.log('❌ No se encontró la oferta 1');
      return;
    }

    console.log(`🏢 OFERTA 1: ${offer.name}`);
    console.log(`🏢 Skills requeridas (${offer.skills?.length || 0}):`);
    offer.skills?.forEach(skill => {
      console.log(`   - ${skill.name}`);
    });
    console.log(`🏢 Profamilys requeridas: ${offer.profamilys?.map(p => p.name).join(', ') || 'Ninguna'}\n`);

    // Buscar a Sofía Pérez - primero buscar por ID conocido o por nombre
    // Basándome en el output anterior, Sofía tiene ID 7
    const sofia = await Student.findOne({
      where: { id: 7 }, // ID conocido de Sofía
      include: [
        {
          model: StudentSkill,
          as: 'studentSkills',
          include: [{ model: Skill, as: 'skill' }]
        },
        {
          model: Cv,
          as: 'cv'
        },
        {
          model: User,
          as: 'user'
        },
        {
          model: Profamily,
          as: 'profamily'
        }
      ]
    });

    if (!sofia) {
      console.log('❌ No se encontró a Sofía Pérez');
      return;
    }

    console.log(`👤 SOFÍA PÉREZ:`);
    console.log(`   - Profamily: ${sofia.profamily?.name || 'Ninguna'}`);
    console.log(`   - Skills (${sofia.studentSkills?.length || 0}):`);
    sofia.studentSkills?.forEach(ss => {
      console.log(`     - ${ss.skill.name} (nivel ${ss.proficiencyLevel})`);
    });

    // Verificar coincidencias manualmente
    console.log('\n🔍 ANÁLISIS MANUAL:');
    const offerSkillNames = offer.skills?.map(s => s.name.toLowerCase()) || [];
    const sofiaSkillNames = sofia.studentSkills?.map(ss => ss.skill.name.toLowerCase()) || [];

    console.log(`   Skills requeridas: ${offerSkillNames.join(', ')}`);
    console.log(`   Skills de Sofía: ${sofiaSkillNames.join(', ')}`);

    const matches = offerSkillNames.filter(skill => sofiaSkillNames.includes(skill));
    const coverage = offerSkillNames.length > 0 ? (matches.length / offerSkillNames.length) * 100 : 0;

    console.log(`   ✅ Coincidencias: ${matches.length}/${offerSkillNames.length} (${coverage.toFixed(1)}%)`);
    console.log(`   Matches: ${matches.join(', ')}`);

    // Verificar profamily
    const offerProfamilyIds = offer.profamilys?.map(p => p.id) || [];
    const sofiaProfamilyId = sofia.profamilyId;

    const profamilyMatch = offerProfamilyIds.includes(sofiaProfamilyId);
    console.log(`   👨‍👩‍👧‍👦 Profamily match: ${profamilyMatch ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Offer profamilys: [${offerProfamilyIds.join(', ')}]`);
    console.log(`   Sofía profamily: ${sofiaProfamilyId}`);

    // Calcular afinidad
    console.log('\n📊 CÁLCULO DE AFINIDAD:');
    const calculator = new AffinityCalculator();
    const affinity = calculator.calculateStudentToOfferAffinity(sofia, offer);

    console.log(`   Score: ${affinity.score.toFixed(2)} (${affinity.level})`);
    console.log(`   Coverage: ${affinity.coveragePercentage}%`);
    console.log(`   Base score from profamily: ${affinity.factors?.baseScoreFromProfamily || 'N/A'}`);
    console.log(`   Profamily level: ${affinity.factors?.profamilyAffinity?.level || 'none'}`);

    // Debug detallado
    console.log('\n🐛 DEBUG DETALLADO:');
    console.log('Factors:', JSON.stringify(affinity.factors, null, 2));

  } catch (error) {
    console.error('❌ Error en la investigación:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la investigación
investigateSofiaAffinity();