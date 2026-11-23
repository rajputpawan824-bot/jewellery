'use strict';

/**
 * Table: inventory (model Inventory)
 * Stock per variant per store (ProductVariant <-> Store)
 *
 * Primary key: variant_id, store_id
 * References: product_variants, stores
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'inventory',
      {
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        store_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        qty_on_hand: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        qty_reserved: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('inventory', ['store_id'], { name: 'ix_inventory_store' });

    // Foreign keys
    await queryInterface.addConstraint('inventory', {
      name: 'fk_inventory_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('inventory', {
      name: 'fk_inventory_store_id',
      type: 'foreign key',
      fields: ['store_id'],
      references: { table: 'stores', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `inventory` ADD CONSTRAINT `ck_inventory_qty` CHECK (qty_on_hand >= 0 AND qty_reserved >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inventory');
  },
};
