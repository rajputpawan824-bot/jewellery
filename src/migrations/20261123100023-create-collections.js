'use strict';

/**
 * Table: collections (model Collection)
 * "Shop by Collections": Heritage, Exquisite, Celestial ...
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'collections',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(120), allowNull: false },
        slug: { type: Sequelize.STRING(140), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        banner_url: { type: Sequelize.STRING(500), allowNull: true },
        is_featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('collections', ['slug'], { name: 'uq_collections_slug', unique: true });
    await queryInterface.addIndex('collections', ['is_active', 'is_featured', 'sort_order'], { name: 'ix_collections_featured' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('collections');
  },
};
