'use strict';

/**
 * Table: product_tags (model ProductTag)
 * Free-form tags: #trending, bridal, daily-wear ...
 *
 * Primary key: product_id, tag
 * References: products
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'product_tags',
      {
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        tag: { type: Sequelize.STRING(60), allowNull: false, primaryKey: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('product_tags', ['tag'], { name: 'ix_pt_tag' });

    // Foreign keys
    await queryInterface.addConstraint('product_tags', {
      name: 'fk_product_tags_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_tags');
  },
};
