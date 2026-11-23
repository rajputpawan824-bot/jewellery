'use strict';

/**
 * Table: metals (model Metal)
 * Metal master (Customization popup: color WHITE/YELLOW/ROSE, purity 14kt/18kt)
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'metals',
      {
        id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        metal: { type: Sequelize.ENUM('GOLD', 'PLATINUM', 'SILVER'), allowNull: false },
        purity: { type: Sequelize.STRING(10), allowNull: false },
        color: { type: Sequelize.ENUM('YELLOW', 'WHITE', 'ROSE', 'NA'), allowNull: false, defaultValue: 'NA' },
        fineness: { type: Sequelize.DECIMAL(5, 3), allowNull: false },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('metals', ['metal', 'purity', 'color'], { name: 'uq_metals', unique: true });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `metals` ADD CONSTRAINT `ck_metals_fineness` CHECK (fineness > 0 AND fineness <= 1)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('metals');
  },
};
