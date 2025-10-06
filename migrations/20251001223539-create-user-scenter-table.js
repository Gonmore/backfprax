'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('UserScenter', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      scenterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'scenters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      assignedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Agregar índices únicos para evitar duplicados
    await queryInterface.addIndex('UserScenter', ['userId', 'scenterId'], {
      unique: true,
      name: 'unique_user_scenter'
    });

    await queryInterface.addIndex('UserScenter', ['scenterId'], {
      name: 'idx_scenter_users'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('UserScenter');
  }
};
