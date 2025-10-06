const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ausbildung', 'postgres', 'D3v3/op3R', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

async function checkSkills() {
    try {
        const [skills] = await sequelize.query('SELECT id, name FROM "skills" ORDER BY name');
        console.log('Skills disponibles:');
        skills.forEach(s => {
            console.log(`  ${s.id}: ${s.name}`);
        });
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSkills();