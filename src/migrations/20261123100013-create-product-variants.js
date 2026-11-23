'use strict';

/**
 * Table: product_variants (model ProductVariant)
 * Sellable unit = product + metal/purity/color + size  (SKU "14YGEE-01")
 *
 * Primary key: id
 * References: products, metals
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'product_variants',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        sku: { type: Sequelize.STRING(60), allowNull: false },
        metal_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false },
        size_label: { type: Sequelize.STRING(20), allowNull: true },
        gold_weight_g: { type: Sequelize.DECIMAL(9, 3), allowNull: true },
        stone_weight_ct: { type: Sequelize.DECIMAL(9, 3), allowNull: true },
        gross_weight_g: { type: Sequelize.DECIMAL(9, 3), allowNull: true },
        height_mm: { type: Sequelize.DECIMAL(7, 2), allowNull: true },
        width_mm: { type: Sequelize.DECIMAL(7, 2), allowNull: true },
        length_mm: { type: Sequelize.DECIMAL(7, 2), allowNull: true },
        metal_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        stone_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        making_charges: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        other_charges: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        tax_rate_pct: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 3 },
        tax_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        mrp: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        currency_code: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'INR' },
        price_updated_at: { type: Sequelize.DATE, allowNull: true },
        is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_made_to_order: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        lead_time_days: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('product_variants', ['sku'], { name: 'uq_variants_sku', unique: true });
    await queryInterface.addIndex('product_variants', ['product_id', 'metal_id', 'size_label'], { name: 'uq_variants_combo', unique: true });
    await queryInterface.addIndex('product_variants', ['product_id', 'status', 'is_default'], { name: 'ix_variants_product' });
    await queryInterface.addIndex('product_variants', ['metal_id', 'status', 'mrp'], { name: 'ix_variants_metal_price' });
    await queryInterface.addIndex('product_variants', ['status', 'mrp'], { name: 'ix_variants_price' });

    // Foreign keys
    await queryInterface.addConstraint('product_variants', {
      name: 'fk_product_variants_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('product_variants', {
      name: 'fk_product_variants_metal_id',
      type: 'foreign key',
      fields: ['metal_id'],
      references: { table: 'metals', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `product_variants` ADD CONSTRAINT `ck_variants_price` CHECK (mrp >= 0 AND tax_rate_pct BETWEEN 0 AND 100)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_variants');
  },
};
