'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Crear el scenter "Instituto Profesional de Valencia"
    const [scenterResult] = await queryInterface.bulkInsert('scenters', [{
      name: 'Instituto Profesional de Valencia',
      code: 'IPV',
      city: 'Valencia',
      address: 'Calle Principal 123, Valencia',
      phone: '+56912345678',
      email: 'contacto@ipvalencia.cl',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    const scenterId = scenterResult.id || scenterResult;

    // Crear usuario administrador del scenter
    const hashedPassword = await bcrypt.hash('Valencia2024!', 10);

    const [userResult] = await queryInterface.bulkInsert('users', [{
      username: 'admin.ipvalencia',
      email: 'admin@ipvalencia.cl',
      password: hashedPassword,
      role: 'scenter',
      name: 'Administrador',
      surname: 'IP Valencia',
      phone: '+56912345678',
      active: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    const userId = userResult.id || userResult;

    // Asociar el usuario al scenter
    await queryInterface.bulkInsert('UserScenter', [{
      userId: userId,
      scenterId: scenterId,
      isActive: true,
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    // Eliminar la asociación
    await queryInterface.bulkDelete('UserScenter', {
      '$scenter.name$': 'Instituto Profesional de Valencia'
    }, {
      include: [{
        model: queryInterface.sequelize.models.scenters,
        as: 'scenter'
      }]
    });

    // Eliminar el usuario
    await queryInterface.bulkDelete('users', {
      email: 'admin@ipvalencia.cl'
    });

    // Eliminar el scenter
    await queryInterface.bulkDelete('scenters', {
      name: 'Instituto Profesional de Valencia'
    });
  }
};
