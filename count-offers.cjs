const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ausbildung', 'postgres', 'D3v3/op3R', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

async function countOffers() {
    try {
        const [offers] = await sequelize.query('SELECT COUNT(*) as count FROM "offers"');
        console.log(`Total ofertas: ${offers[0].count}`);
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

countOffers();