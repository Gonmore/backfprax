import sequelize from './src/database/database.js';
import { UserScenter } from './src/models/userScenter.js';

async function runMigration() {
    try {
        console.log('🔄 Sincronizando tabla UserScenter...');

        // Sincronizar la tabla UserScenter
        await UserScenter.sync({ force: false });

        console.log('✅ Tabla UserScenter creada/verificada exitosamente');

        // Verificar que la tabla existe
        const result = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'UserScenter'");
        if (result[0].length > 0) {
            console.log('✅ Tabla UserScenter confirmada en la base de datos');
        } else {
            console.log('❌ Tabla UserScenter no encontrada');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

runMigration();