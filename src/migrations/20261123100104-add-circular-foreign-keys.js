'use strict';

/**
 * Foreign keys that close a reference cycle between two tables, so they can only be
 * added after both tables exist. The models declare these with `constraints: false`.
 *   plan_enrollments.redeemed_order_id -> orders.id
 *   gift_cards.purchase_payment_id -> payments.id
 *   plan_installments.payment_id -> payments.id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('plan_enrollments', {
      name: 'fk_plan_enrollments_redeemed_order_id',
      type: 'foreign key',
      fields: ['redeemed_order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('gift_cards', {
      name: 'fk_gift_cards_purchase_payment_id',
      type: 'foreign key',
      fields: ['purchase_payment_id'],
      references: { table: 'payments', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('plan_installments', {
      name: 'fk_plan_installments_payment_id',
      type: 'foreign key',
      fields: ['payment_id'],
      references: { table: 'payments', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('plan_installments', 'fk_plan_installments_payment_id');
    await queryInterface.removeConstraint('gift_cards', 'fk_gift_cards_purchase_payment_id');
    await queryInterface.removeConstraint('plan_enrollments', 'fk_plan_enrollments_redeemed_order_id');
  },
};
