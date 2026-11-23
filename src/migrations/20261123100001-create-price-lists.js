'use strict';

/**
 * Table: price_lists (model PriceList)
 * Price lists: RETAIL (default B2C) now; WHOLESALE / tiered lists for B2B later.
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'price_lists',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        code: { type: Sequelize.STRING(40), allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        customer_type: { type: Sequelize.ENUM('B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
        currency_code: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'INR' },
        making_charge_discount_pct: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
        is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        valid_from: { type: Sequelize.DATE, allowNull: true },
        valid_to: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('price_lists', ['code'], { name: 'uq_price_lists_code', unique: true });
    await queryInterface.addIndex('price_lists', ['customer_type', 'is_active'], { name: 'ix_price_lists_type_active' });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `price_lists` ADD CONSTRAINT `ck_pl_discount` CHECK (making_charge_discount_pct BETWEEN 0 AND 100)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('price_lists');
  },
};
