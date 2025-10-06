import sequelize from './src/database/database.js';
import { UserScenter } from './src/models/userScenter.js';

async function recreateTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a BD');

        console.log('🗑️ Eliminando tabla UserScenter existente...');
        await sequelize.query('DROP TABLE IF EXISTS "UserScenter";');
        console.log('✅ Tabla eliminada');

        console.log('🔄 Recreando tabla UserScenter...');
        await UserScenter.sync({ force: true });
        console.log('✅ Tabla recreada');

        // Verificar estructura
        const result = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'UserScenter' AND table_schema = 'public' ORDER BY ordinal_position;");
        console.log('📋 Columnas en UserScenter:');
        result[0].forEach(col => console.log('   -', col.column_name));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

recreateTable();