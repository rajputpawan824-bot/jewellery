'use strict';

/**
 * Table: stone_types (model StoneType)
 * Diamond, Emerald, Pearl, Blue Evil Eye ...
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'stone_types',
      {
        id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(60), allowNull: false },
        slug: { type: Sequelize.STRING(80), allowNull: false },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('stone_types', ['slug'], { name: 'uq_stone_types_slug', unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stone_types');
  },
};
