import sequelize from '../src/database/database.js';
import { Offer, OfferProfamily } from '../src/models/relations.js';

/**
 * Script para migrar datos existentes de offers.profamilyId a offer_profamilys
 */

async function migrateOfferProfamilys() {
    try {
        console.log('🚀 Iniciando migración de datos de offers a offer_profamilys...');

        // Obtener todas las ofertas que tienen profamilyId
        const offersWithProfamily = await Offer.findAll({
            where: {
                profamilyId: { [require('sequelize').Op.ne]: null }
            }
        });

        console.log(`📋 Encontradas ${offersWithProfamily.length} ofertas con profamilyId`);

        let migratedCount = 0;

        for (const offer of offersWithProfamily) {
            // Verificar si ya existe la relación
            const existingRelation = await OfferProfamily.findOne({
                where: {
                    offerId: offer.id,
                    profamilyId: offer.profamilyId
                }
            });

            if (!existingRelation) {
                // Crear la nueva relación
                await OfferProfamily.create({
                    offerId: offer.id,
                    profamilyId: offer.profamilyId
                });

                console.log(`   ➕ Migrada oferta ${offer.id} -> profamily ${offer.profamilyId}`);
                migratedCount++;
            } else {
                console.log(`   ℹ️ Relación ya existe para oferta ${offer.id}`);
            }
        }

        console.log(`\n✅ Migración completada: ${migratedCount} relaciones creadas`);

        // Opcional: Eliminar la columna profamilyId de offers después de la migración
        // Esto se haría en una migración separada para ser seguro

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Probar APIs con la nueva estructura');
        console.log('   2. Actualizar frontend');

    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await migrateOfferProfamilys();

        console.log('\n🎉 Migración de datos completada exitosamente');

    } catch (error) {
        console.error('💥 Error en la migración:', error);
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

export { migrateOfferProfamilys };