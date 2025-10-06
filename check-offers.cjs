const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ausbildung', 'postgres', 'D3v3/op3R', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

async function checkOffers() {
    try {
        const [offers] = await sequelize.query('SELECT id, name, description FROM "offers" ORDER BY id');
        console.log('Ofertas disponibles:');
        offers.forEach(o => {
            console.log(`  ${o.id}: ${o.name} - ${o.description?.substring(0, 50) || 'Sin descripción'}`);
        });
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkOffers();