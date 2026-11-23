'use strict';

/**
 * Table: wallet_transactions (model WalletTransaction)
 * PASSBOOK: Purchased -3,250 / Store Cash Applied +500 / Courtesy ...
 * reference_type + reference_id is a polymorphic pointer (ORDER / RETURN / GIFT_CARD / PLAN), no FK.
 *
 * Primary key: id
 * References: wallets
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'wallet_transactions',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        wallet_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        direction: { type: Sequelize.ENUM('CREDIT', 'DEBIT'), allowNull: false },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        balance_after: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        source: { type: Sequelize.ENUM('ORDER_PAYMENT', 'REFUND', 'BUYBACK', 'GIFT_CARD', 'COURTESY', 'CASHBACK', 'PLAN_MATURITY', 'ADJUSTMENT'), allowNull: false },
        reference_type: { type: Sequelize.STRING(30), allowNull: true },
        reference_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        description: { type: Sequelize.STRING(255), allowNull: true },
        idempotency_key: { type: Sequelize.STRING(64), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('wallet_transactions', ['idempotency_key'], { name: 'uq_wt_idem', unique: true });
    await queryInterface.addIndex('wallet_transactions', ['wallet_id', 'created_at'], { name: 'ix_wt_wallet_time' });
    await queryInterface.addIndex('wallet_transactions', ['reference_type', 'reference_id'], { name: 'ix_wt_reference' });

    // Foreign keys
    await queryInterface.addConstraint('wallet_transactions', {
      name: 'fk_wallet_transactions_wallet_id',
      type: 'foreign key',
      fields: ['wallet_id'],
      references: { table: 'wallets', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `wallet_transactions` ADD CONSTRAINT `ck_wt_amount` CHECK (amount > 0 AND balance_after >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wallet_transactions');
  },
};
