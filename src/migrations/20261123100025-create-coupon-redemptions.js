'use strict';

/**
 * Table: coupon_redemptions (model CouponRedemption)
 * Who used which coupon on which order (per-user limits)
 *
 * Primary key: id
 * References: coupons, users, orders
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'coupon_redemptions',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        coupon_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        discount_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('coupon_redemptions', ['order_id', 'coupon_id'], { name: 'uq_cr_order_coupon', unique: true });
    await queryInterface.addIndex('coupon_redemptions', ['coupon_id', 'user_id'], { name: 'ix_cr_coupon_user' });
    await queryInterface.addIndex('coupon_redemptions', ['user_id'], { name: 'ix_coupon_redemptions_user_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('coupon_redemptions', {
      name: 'fk_coupon_redemptions_coupon_id',
      type: 'foreign key',
      fields: ['coupon_id'],
      references: { table: 'coupons', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('coupon_redemptions', {
      name: 'fk_coupon_redemptions_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('coupon_redemptions', {
      name: 'fk_coupon_redemptions_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coupon_redemptions');
  },
};
