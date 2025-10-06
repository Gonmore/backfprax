import sequelize from './src/database/database.js';
import { User, Scenter, UserScenter } from './src/models/relations.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

async function setupScenterUser() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');

        console.log('🔄 Sincronizando modelos...');
        await sequelize.sync();
        console.log('✅ Modelos sincronizados');

        // Verificar si ya existe el scenter
        let scenter = await Scenter.findOne({
            where: { name: 'Instituto Profesional de Valencia' }
        });

        if (!scenter) {
            console.log('🏫 Creando scenter "Instituto Profesional de Valencia"...');
            scenter = await Scenter.create({
                name: 'Instituto Profesional de Valencia',
                code: 'IPV',
                city: 'Valencia',
                address: 'Calle Principal 123, Valencia',
                phone: '+56912345678',
                email: 'contacto@ipvalencia.cl',
                active: true
            });
            console.log('✅ Scenter creado:', scenter.id);
        } else {
            console.log('ℹ️ Scenter ya existe:', scenter.id);
        }

        // Verificar si ya existe el usuario
        let user = await User.findOne({
            where: { email: 'admin@ipvalencia.cl' }
        });

        if (!user) {
            console.log('👤 Creando usuario administrador del scenter...');
            const hashedPassword = await bcrypt.hash('Valencia2024!', 10);

            user = await User.create({
                username: 'admin.ipvalencia',
                email: 'admin@ipvalencia.cl',
                password: hashedPassword,
                role: 'scenter',
                name: 'Administrador',
                surname: 'IP Valencia',
                phone: '+56912345678',
                active: true,
                status: 'active'
            });
            console.log('✅ Usuario creado:', user.id);
        } else {
            console.log('ℹ️ Usuario ya existe:', user.id);
        }

        // Verificar si ya existe la asociación
        const existingAssociation = await UserScenter.findOne({
            where: {
                userId: user.id,
                scenterId: scenter.id
            }
        });

        if (!existingAssociation) {
            console.log('🔗 Creando asociación User-Scenter...');
            await UserScenter.create({
                userId: user.id,
                scenterId: scenter.id,
                isActive: true,
                assignedAt: new Date()
            });
            console.log('✅ Asociación creada');
        } else {
            console.log('ℹ️ Asociación ya existe');
        }

        console.log('🎉 Setup completado exitosamente!');
        console.log('📋 Credenciales del usuario scenter:');
        console.log('   Email: admin@ipvalencia.cl');
        console.log('   Password: Valencia2024!');
        console.log('   Role: scenter');

    } catch (error) {
        console.error('❌ Error durante el setup:', error);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

setupScenterUser();