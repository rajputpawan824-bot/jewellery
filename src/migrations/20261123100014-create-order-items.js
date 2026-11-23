'use strict';

/**
 * Table: order_items (model OrderItem)
 * Order line. Product details are snapshotted at purchase time (catalog may change).
 *
 * Primary key: id
 * References: orders, products, product_variants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'order_items',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        product_name: { type: Sequelize.STRING(200), allowNull: false },
        sku: { type: Sequelize.STRING(60), allowNull: false },
        metal_desc: { type: Sequelize.STRING(60), allowNull: true },
        stone_desc: { type: Sequelize.STRING(150), allowNull: true },
        size_label: { type: Sequelize.STRING(20), allowNull: true },
        certification: { type: Sequelize.STRING(60), allowNull: true },
        image_url: { type: Sequelize.STRING(500), allowNull: true },
        customization: { type: Sequelize.JSON, allowNull: true },
        gift_message: { type: Sequelize.STRING(500), allowNull: true },
        quantity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
        gold_weight_g: { type: Sequelize.DECIMAL(9, 3), allowNull: true },
        metal_rate_per_g: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        metal_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        stone_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        making_charges: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        unit_price: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        line_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        status: { type: Sequelize.ENUM('ACTIVE', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'EXCHANGED', 'BOUGHT_BACK'), allowNull: false, defaultValue: 'ACTIVE' },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('order_items', ['order_id'], { name: 'ix_oi_order' });
    await queryInterface.addIndex('order_items', ['variant_id'], { name: 'ix_oi_variant' });
    await queryInterface.addIndex('order_items', ['product_id'], { name: 'ix_oi_product' });

    // Foreign keys
    await queryInterface.addConstraint('order_items', {
      name: 'fk_order_items_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('order_items', {
      name: 'fk_order_items_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('order_items', {
      name: 'fk_order_items_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `order_items` ADD CONSTRAINT `ck_oi_amounts` CHECK (quantity >= 1 AND unit_price >= 0 AND line_total >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
  },
};
