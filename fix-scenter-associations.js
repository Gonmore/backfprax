import sequelize from './src/database/database.js';
import { User, UserScenter, Scenter } from './src/models/relations.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

async function fixScenterAssociations() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a BD');

        // Buscar todos los usuarios scenter
        const scenterUsers = await User.findAll({
            where: { role: 'scenter' }
        });

        console.log(`👥 Encontrados ${scenterUsers.length} usuarios scenter`);

        for (const user of scenterUsers) {
            console.log(`\n🔍 Revisando usuario: ${user.email} (ID: ${user.id})`);

            // Verificar si ya tiene asociación activa
            const existingAssoc = await UserScenter.findOne({
                where: { userId: user.id, isActive: true }
            });

            if (existingAssoc) {
                console.log(`   ✅ Ya tiene asociación activa con scenterId: ${existingAssoc.scenterId}`);
                continue;
            }

            // Si no tiene asociación, buscar un scenter apropiado
            // Primero intentar por email/nombre
            let targetScenter = null;

            if (user.email.includes('ipvalencia') || user.email.includes('valencia')) {
                targetScenter = await Scenter.findOne({
                    where: { name: { [Op.iLike]: '%valencia%' } }
                });
            } else if (user.email.includes('futuro')) {
                targetScenter = await Scenter.findOne({
                    where: { name: { [Op.iLike]: '%futuro%' } }
                });
            }

            // Si no encontró por nombre, tomar el primer scenter activo
            if (!targetScenter) {
                targetScenter = await Scenter.findOne({
                    where: { active: true },
                    order: [['name', 'ASC']]
                });
            }

            if (targetScenter) {
                console.log(`   🔗 Creando asociación con: ${targetScenter.name} (ID: ${targetScenter.id})`);

                await UserScenter.create({
                    userId: user.id,
                    scenterId: targetScenter.id,
                    isActive: true,
                    assignedAt: new Date()
                });

                console.log(`   ✅ Asociación creada exitosamente`);
            } else {
                console.log(`   ❌ No se encontró ningún scenter activo para asociar`);
            }
        }

        console.log('\n🎉 Proceso completado');

        // Verificar resultado final
        const finalCheck = await User.findAll({
            where: { role: 'scenter' },
            include: [{
                model: UserScenter,
                as: 'userScenters',
                where: { isActive: true },
                required: true,
                include: [{ model: Scenter, as: 'scenter' }]
            }]
        });

        console.log(`\n📊 Resumen final: ${finalCheck.length} usuarios scenter con asociaciones activas`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixScenterAssociations();