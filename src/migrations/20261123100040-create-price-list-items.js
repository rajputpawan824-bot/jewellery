'use strict';

/**
 * Table: price_list_items (model PriceListItem)
 * B2B (and special B2C) pricing per variant; tiered by quantity for wholesale.
 *
 * Primary key: id
 * References: price_lists, product_variants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'price_list_items',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        price_list_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        min_qty: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
        fixed_price: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        making_charge_discount_pct: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        valid_from: { type: Sequelize.DATE, allowNull: true },
        valid_to: { type: Sequelize.DATE, allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('price_list_items', ['price_list_id', 'variant_id', 'min_qty'], { name: 'uq_pli', unique: true });
    await queryInterface.addIndex('price_list_items', ['variant_id'], { name: 'ix_pli_variant' });

    // Foreign keys
    await queryInterface.addConstraint('price_list_items', {
      name: 'fk_price_list_items_price_list_id',
      type: 'foreign key',
      fields: ['price_list_id'],
      references: { table: 'price_lists', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('price_list_items', {
      name: 'fk_price_list_items_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `price_list_items` ADD CONSTRAINT `ck_pli_values` CHECK (min_qty >= 1 AND (fixed_price IS NULL OR fixed_price >= 0) AND (making_charge_discount_pct IS NULL OR making_charge_discount_pct BETWEEN 0 AND 100))'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('price_list_items');
  },
};
