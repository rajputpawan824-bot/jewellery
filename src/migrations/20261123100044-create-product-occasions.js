'use strict';

/**
 * Table: product_occasions (model ProductOccasion)
 * Product <-> Occasion (many-to-many)
 *
 * Primary key: product_id, occasion_id
 * References: products, occasions
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'product_occasions',
      {
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        occasion_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('product_occasions', ['occasion_id'], { name: 'ix_po_occasion' });

    // Foreign keys
    await queryInterface.addConstraint('product_occasions', {
      name: 'fk_product_occasions_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('product_occasions', {
      name: 'fk_product_occasions_occasion_id',
      type: 'foreign key',
      fields: ['occasion_id'],
      references: { table: 'occasions', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_occasions');
  },
};
