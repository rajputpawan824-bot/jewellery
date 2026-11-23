'use strict';

/**
 * Table: categories (model Category)
 * Rings, Earrings, Necklaces, Mangalsutra, Amulets ... (self-referencing tree)
 *
 * Primary key: id
 * References: categories
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'categories',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        parent_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        name: { type: Sequelize.STRING(120), allowNull: false },
        slug: { type: Sequelize.STRING(140), allowNull: false },
        image_url: { type: Sequelize.STRING(500), allowNull: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('categories', ['slug'], { name: 'uq_categories_slug', unique: true });
    await queryInterface.addIndex('categories', ['parent_id', 'is_active', 'sort_order'], { name: 'ix_categories_parent' });

    // Foreign keys
    await queryInterface.addConstraint('categories', {
      name: 'fk_categories_parent_id',
      type: 'foreign key',
      fields: ['parent_id'],
      references: { table: 'categories', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  },
};
