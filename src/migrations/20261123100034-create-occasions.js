'use strict';

/**
 * Table: occasions (model Occasion)
 * "Gifts for Every Chapter": Anniversary, Engagement, Weddings, Festivals, For Mothers
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'occasions',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(80), allowNull: false },
        slug: { type: Sequelize.STRING(100), allowNull: false },
        tagline: { type: Sequelize.STRING(150), allowNull: true },
        image_url: { type: Sequelize.STRING(500), allowNull: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('occasions', ['slug'], { name: 'uq_occasions_slug', unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('occasions');
  },
};
