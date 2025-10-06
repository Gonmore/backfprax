const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ausbildung', 'postgres', 'D3v3/op3R', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

async function checkOfferSkills() {
    try {
        const [skills] = await sequelize.query('SELECT os.*, s.name FROM "offer_skills" os JOIN "skills" s ON os."skillId" = s.id WHERE os."offerId" = 1');
        console.log('Skills de la oferta 1:');
        skills.forEach(s => {
            console.log(`  ${s.name}`);
        });
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkOfferSkills();