'use strict';

/**
 * Table: coupon_scopes (model CouponScope)
 * Polymorphic: scope_id points to categories / collections / products depending on scope_type.
 * Only coupon_id has a real FK; use getTarget() or the scoped associations on Coupon.
 *
 * Primary key: coupon_id, scope_type, scope_id
 * References: coupons
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'coupon_scopes',
      {
        coupon_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        scope_type: { type: Sequelize.ENUM('CATEGORY', 'COLLECTION', 'PRODUCT'), allowNull: false, primaryKey: true },
        scope_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('coupon_scopes', ['scope_type', 'scope_id'], { name: 'ix_cs_scope' });

    // Foreign keys
    await queryInterface.addConstraint('coupon_scopes', {
      name: 'fk_coupon_scopes_coupon_id',
      type: 'foreign key',
      fields: ['coupon_id'],
      references: { table: 'coupons', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coupon_scopes');
  },
};
