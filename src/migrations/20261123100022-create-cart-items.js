'use strict';

/**
 * Table: cart_items (model CartItem)
 *
 * Primary key: id
 * References: carts, product_variants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'cart_items',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        cart_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        quantity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
        customization: { type: Sequelize.JSON, allowNull: true },
        customization_hash: { type: Sequelize.CHAR(32), allowNull: false, defaultValue: '' },
        gift_message: { type: Sequelize.STRING(500), allowNull: true },
        unit_price_at_add: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        added_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('cart_items', ['cart_id', 'variant_id', 'customization_hash'], { name: 'uq_cart_line', unique: true });
    await queryInterface.addIndex('cart_items', ['variant_id'], { name: 'ix_ci_variant' });

    // Foreign keys
    await queryInterface.addConstraint('cart_items', {
      name: 'fk_cart_items_cart_id',
      type: 'foreign key',
      fields: ['cart_id'],
      references: { table: 'carts', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('cart_items', {
      name: 'fk_cart_items_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `cart_items` ADD CONSTRAINT `ck_ci_quantity` CHECK (quantity >= 1)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cart_items');
  },
};
