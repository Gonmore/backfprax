const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ausbildung', 'postgres', 'D3v3/op3R', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log
});

// Skills de marketing para asignar a la oferta
const marketingSkills = [
    'Comunicación',
    'Inglés',
    'Alemán',
    'Marketing digital',
    'Social Media',
    'Branding',
    'Creatividad'
];

async function assignMarketingSkillsToOffer() {
    console.log('🎯 Asignando skills de marketing a la oferta existente...\n');

    try {
        for (const skillName of marketingSkills) {
            // Buscar el skill por nombre
            const [skillResult] = await sequelize.query(`
                SELECT id FROM "skills" WHERE name = '${skillName}'
            `);

            if (skillResult.length === 0) {
                console.log(`   ⚠️  Skill no encontrado: ${skillName}`);
                continue;
            }

            const skillId = skillResult[0].id;

            // Verificar si ya existe la relación
            const [existingRelation] = await sequelize.query(`
                SELECT * FROM "offer_skills"
                WHERE "offerId" = 1 AND "skillId" = ${skillId}
            `);

            if (existingRelation.length > 0) {
                console.log(`   ⏭️  Ya existe relación: ${skillName}`);
                continue;
            }

            // Crear la relación offer_skills
            await sequelize.query(`
                INSERT INTO "offer_skills" ("offerId", "skillId", "createdAt", "updatedAt")
                VALUES (1, ${skillId}, NOW(), NOW())
            `);

            console.log(`   ✅ Asignado: ${skillName}`);
        }

        // Verificar resultados finales
        console.log('\n📈 RESUMEN FINAL:');
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as count FROM "offer_skills" WHERE "offerId" = 1
        `);
        console.log(`   Oferta 1 tiene ahora: ${countResult[0].count} skills`);

        await sequelize.close();
        console.log('\n✅ Proceso completado exitosamente');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignMarketingSkillsToOffer();