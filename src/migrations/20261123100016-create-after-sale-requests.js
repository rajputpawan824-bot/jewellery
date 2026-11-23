'use strict';

/**
 * Table: after_sale_requests (model AfterSaleRequest)
 * Return Order / Buy Back / Exchange, with pickup and payout details
 *
 * Primary key: id
 * References: orders, order_items, users, stores, user_bank_accounts
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'after_sale_requests',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        request_number: { type: Sequelize.STRING(30), allowNull: false },
        request_type: { type: Sequelize.ENUM('RETURN', 'EXCHANGE', 'BUYBACK'), allowNull: false },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        order_item_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        reason: { type: Sequelize.ENUM('SIZE_FIT', 'CHANGED_MIND', 'DAMAGED', 'NOT_AS_DESCRIBED', 'UPGRADE', 'OTHER'), allowNull: true },
        reason_note: { type: Sequelize.STRING(500), allowNull: true },
        pickup_method: { type: Sequelize.ENUM('COURIER_PICKUP', 'BOUTIQUE_DROP_OFF'), allowNull: false },
        drop_off_store_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        pickup_address: { type: Sequelize.JSON, allowNull: true },
        estimated_value: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        final_value: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        deduction_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        payout_method: { type: Sequelize.ENUM('WALLET', 'BANK_ACCOUNT', 'ORIGINAL_SOURCE', 'EXCHANGE_ORDER'), allowNull: true },
        bank_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        exchange_order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        status: { type: Sequelize.ENUM('REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'RECEIVED', 'QUALITY_CHECK', 'COMPLETED', 'REJECTED', 'CANCELLED'), allowNull: false, defaultValue: 'REQUESTED' },
        qc_notes: { type: Sequelize.STRING(500), allowNull: true },
        completed_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('after_sale_requests', ['request_number'], { name: 'uq_asr_number', unique: true });
    await queryInterface.addIndex('after_sale_requests', ['user_id', 'created_at'], { name: 'ix_asr_user' });
    await queryInterface.addIndex('after_sale_requests', ['order_item_id'], { name: 'ix_asr_order_item' });
    await queryInterface.addIndex('after_sale_requests', ['request_type', 'status', 'created_at'], { name: 'ix_asr_status' });
    await queryInterface.addIndex('after_sale_requests', ['order_id'], { name: 'ix_after_sale_requests_order_id' }); // FK lookup
    await queryInterface.addIndex('after_sale_requests', ['drop_off_store_id'], { name: 'ix_after_sale_requests_drop_off_store_id' }); // FK lookup
    await queryInterface.addIndex('after_sale_requests', ['bank_account_id'], { name: 'ix_after_sale_requests_bank_account_id' }); // FK lookup
    await queryInterface.addIndex('after_sale_requests', ['exchange_order_id'], { name: 'ix_after_sale_requests_exchange_order_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('after_sale_requests', {
      name: 'fk_after_sale_requests_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('after_sale_requests', {
      name: 'fk_after_sale_requests_order_item_id',
      type: 'foreign key',
      fields: ['order_item_id'],
      references: { table: 'order_items', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('after_sale_requests', {
      name: 'fk_after_sale_requests_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('after_sale_requests', {
      name: 'fk_after_sale_requests_drop_off_store_id',
      type: 'foreign key',
      fields: ['drop_off_store_id'],
      references: { table: 'stores', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('after_sale_requests', {
      name: 'fk_after_sale_requests_bank_account_id',
      type: 'foreign key',
      fields: ['bank_account_id'],
      references: { table: 'user_bank_accounts', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('after_sale_requests', {
      name: 'fk_after_sale_requests_exchange_order_id',
      type: 'foreign key',
      fields: ['exchange_order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('after_sale_requests');
  },
};
