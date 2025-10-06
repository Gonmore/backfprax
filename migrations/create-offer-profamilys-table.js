import sequelize from '../src/database/database.js';
import { OfferProfamily } from '../src/models/offerProfamily.js';
import '../src/models/relations.js';

/**
 * Script para crear la tabla offer_profamilys
 * Esta tabla permite que una oferta tenga múltiples familias profesionales
 */

async function createOfferProfamilysTable() {
    try {
        console.log('🚀 Iniciando creación de tabla offer_profamilys...');

        // Sincronizar la tabla OfferProfamily
        await OfferProfamily.sync({ force: false });

        console.log('✅ Tabla offer_profamilys creada exitosamente');
        console.log('📊 Estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - offerId (FK -> offers.id, NOT NULL)');
        console.log('   - profamilyId (FK -> profamilys.id, NOT NULL)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');

        console.log('\n📋 Índices creados:');
        console.log('   - idx_offer_profamilys_offer (offerId)');
        console.log('   - idx_offer_profamilys_profamily (profamilyId)');
        console.log('   - unique_offer_profamily (offerId, profamilyId) - UNIQUE');

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Migrar datos existentes de offers.profamilyId a offer_profamilys');
        console.log('   2. Actualizar modelos y relaciones');

    } catch (error) {
        console.error('❌ Error al crear tabla offer_profamilys:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await createOfferProfamilysTable();

        console.log('\n🎉 Creación de tabla offer_profamilys completada exitosamente');

    } catch (error) {
        console.error('💥 Error en la creación:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔐 Conexión a base de datos cerrada');
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { createOfferProfamilysTable };