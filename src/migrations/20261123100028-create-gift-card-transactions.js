'use strict';

/**
 * Table: gift_card_transactions (model GiftCardTransaction)
 *
 * Primary key: id
 * References: gift_cards, orders
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'gift_card_transactions',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        gift_card_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        txn_type: { type: Sequelize.ENUM('ISSUE', 'REDEEM', 'REFUND', 'EXPIRE'), allowNull: false },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        balance_after: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('gift_card_transactions', ['gift_card_id', 'created_at'], { name: 'ix_gct_card' });
    await queryInterface.addIndex('gift_card_transactions', ['order_id'], { name: 'ix_gct_order' });

    // Foreign keys
    await queryInterface.addConstraint('gift_card_transactions', {
      name: 'fk_gift_card_transactions_gift_card_id',
      type: 'foreign key',
      fields: ['gift_card_id'],
      references: { table: 'gift_cards', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('gift_card_transactions', {
      name: 'fk_gift_card_transactions_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `gift_card_transactions` ADD CONSTRAINT `ck_gct_amount` CHECK (amount > 0 AND balance_after >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('gift_card_transactions');
  },
};
