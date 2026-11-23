'use strict';

/**
 * Table: refunds (model Refund)
 *
 * Primary key: id
 * References: orders, after_sale_requests, payments
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'refunds',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        request_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        payment_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        destination: { type: Sequelize.ENUM('WALLET', 'BANK_ACCOUNT', 'ORIGINAL_SOURCE', 'GIFT_CARD'), allowNull: false },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        gateway_refund_id: { type: Sequelize.STRING(100), allowNull: true },
        status: { type: Sequelize.ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'), allowNull: false, defaultValue: 'PENDING' },
        processed_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('refunds', ['order_id'], { name: 'ix_refunds_order' });
    await queryInterface.addIndex('refunds', ['request_id'], { name: 'ix_refunds_request' });
    await queryInterface.addIndex('refunds', ['status', 'created_at'], { name: 'ix_refunds_status' });
    await queryInterface.addIndex('refunds', ['payment_id'], { name: 'ix_refunds_payment_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('refunds', {
      name: 'fk_refunds_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('refunds', {
      name: 'fk_refunds_request_id',
      type: 'foreign key',
      fields: ['request_id'],
      references: { table: 'after_sale_requests', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('refunds', {
      name: 'fk_refunds_payment_id',
      type: 'foreign key',
      fields: ['payment_id'],
      references: { table: 'payments', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `refunds` ADD CONSTRAINT `ck_refunds_amount` CHECK (amount > 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refunds');
  },
};
