'use strict';

/**
 * Table: compare_items (model CompareItem)
 * Compare popup (Product 1 vs Product 2). Kept server-side so it syncs across devices.
 *
 * Primary key: user_id, variant_id
 * References: users, product_variants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'compare_items',
      {
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('compare_items', ['variant_id'], { name: 'ix_compare_items_variant_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('compare_items', {
      name: 'fk_compare_items_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('compare_items', {
      name: 'fk_compare_items_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('compare_items');
  },
};
