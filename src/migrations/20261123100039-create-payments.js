'use strict';

/**
 * Table: payments (model Payment)
 * One order can have many payments: COD advance + balance, wallet + card,
 * plan installments, gift card purchase, wallet top-up.
 *
 * Primary key: id
 * References: users, orders, plan_installments, gift_cards, user_payment_methods
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'payments',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        purpose: { type: Sequelize.ENUM('ORDER', 'PLAN_INSTALLMENT', 'GIFT_CARD', 'WALLET_TOPUP'), allowNull: false },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        plan_installment_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        gift_card_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        method: { type: Sequelize.ENUM('CARD', 'UPI', 'NET_BANKING', 'APPLE_PAY', 'GOOGLE_PAY', 'WALLET', 'GIFT_CARD', 'PLAN', 'COD', 'BANK_TRANSFER'), allowNull: false },
        user_payment_method_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        gateway: { type: Sequelize.STRING(40), allowNull: true },
        gateway_order_id: { type: Sequelize.STRING(100), allowNull: true },
        gateway_payment_id: { type: Sequelize.STRING(100), allowNull: true },
        bank_code: { type: Sequelize.STRING(40), allowNull: true },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        currency_code: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'INR' },
        status: { type: Sequelize.ENUM('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'), allowNull: false, defaultValue: 'INITIATED' },
        failure_reason: { type: Sequelize.STRING(255), allowNull: true },
        gateway_response: { type: Sequelize.JSON, allowNull: true },
        paid_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('payments', ['gateway', 'gateway_payment_id'], { name: 'uq_payments_gateway', unique: true });
    await queryInterface.addIndex('payments', ['order_id'], { name: 'ix_payments_order' });
    await queryInterface.addIndex('payments', ['plan_installment_id'], { name: 'ix_payments_installment' });
    await queryInterface.addIndex('payments', ['gift_card_id'], { name: 'ix_payments_giftcard' });
    await queryInterface.addIndex('payments', ['user_id', 'created_at'], { name: 'ix_payments_user_time' });
    await queryInterface.addIndex('payments', ['status', 'created_at'], { name: 'ix_payments_status_time' });
    await queryInterface.addIndex('payments', ['gateway_order_id'], { name: 'ix_payments_gateway_order' });
    await queryInterface.addIndex('payments', ['user_payment_method_id'], { name: 'ix_payments_user_payment_method_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('payments', {
      name: 'fk_payments_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('payments', {
      name: 'fk_payments_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('payments', {
      name: 'fk_payments_plan_installment_id',
      type: 'foreign key',
      fields: ['plan_installment_id'],
      references: { table: 'plan_installments', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('payments', {
      name: 'fk_payments_gift_card_id',
      type: 'foreign key',
      fields: ['gift_card_id'],
      references: { table: 'gift_cards', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('payments', {
      name: 'fk_payments_user_payment_method_id',
      type: 'foreign key',
      fields: ['user_payment_method_id'],
      references: { table: 'user_payment_methods', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `payments` ADD CONSTRAINT `ck_payments_amount` CHECK (amount >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
