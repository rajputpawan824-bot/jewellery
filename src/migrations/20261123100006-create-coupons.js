'use strict';

/**
 * Table: coupons (model Coupon)
 * SUMMER10/15/20/30 "x% off on Making Charges"; also auto offers shown as product labels.
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'coupons',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        code: { type: Sequelize.STRING(40), allowNull: false },
        title: { type: Sequelize.STRING(150), allowNull: false },
        description: { type: Sequelize.STRING(500), allowNull: true },
        discount_type: { type: Sequelize.ENUM('PERCENT', 'FLAT'), allowNull: false },
        discount_value: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        applies_on: { type: Sequelize.ENUM('MAKING_CHARGES', 'ORDER_SUBTOTAL', 'METAL_VALUE', 'STONE_VALUE'), allowNull: false, defaultValue: 'MAKING_CHARGES' },
        max_discount: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        min_order_value: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        customer_type: { type: Sequelize.ENUM('ALL', 'B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
        is_auto_apply: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_public: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        usage_limit_total: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
        usage_limit_per_user: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
        used_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        starts_at: { type: Sequelize.DATE, allowNull: false },
        ends_at: { type: Sequelize.DATE, allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('coupons', ['code'], { name: 'uq_coupons_code', unique: true });
    await queryInterface.addIndex('coupons', ['is_active', 'is_public', 'customer_type', 'starts_at', 'ends_at'], { name: 'ix_coupons_live' });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `coupons` ADD CONSTRAINT `ck_coupons_value` CHECK (discount_value > 0 AND (discount_type <> \'PERCENT\' OR discount_value <= 100))'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE `coupons` ADD CONSTRAINT `ck_coupons_window` CHECK (ends_at IS NULL OR ends_at >= starts_at)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coupons');
  },
};
