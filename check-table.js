import sequelize from './src/database/database.js';

async function checkTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado');

        const result = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'UserScenter' AND table_schema = 'public' ORDER BY ordinal_position;");
        console.log('📋 Columnas en UserScenter:');
        result[0].forEach(col => console.log('   -', col.column_name));

        const count = await sequelize.query("SELECT COUNT(*) as total FROM \"UserScenter\";");
        console.log('📊 Registros en UserScenter:', count[0][0].total);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkTable();