'use strict';

/**
 * Table: wallets (model Wallet)
 * My Wallet: "Available E-Cash". One per user (B2C) or per business account (B2B credit).
 *
 * Primary key: id
 * References: users, business_accounts
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'wallets',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        business_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        balance: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        currency_code: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'INR' },
        status: { type: Sequelize.ENUM('ACTIVE', 'FROZEN'), allowNull: false, defaultValue: 'ACTIVE' },
        version: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('wallets', ['user_id'], { name: 'uq_wallet_user', unique: true });
    await queryInterface.addIndex('wallets', ['business_account_id'], { name: 'uq_wallet_business', unique: true });

    // Foreign keys
    await queryInterface.addConstraint('wallets', {
      name: 'fk_wallets_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('wallets', {
      name: 'fk_wallets_business_account_id',
      type: 'foreign key',
      fields: ['business_account_id'],
      references: { table: 'business_accounts', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `wallets` ADD CONSTRAINT `ck_wallet_balance` CHECK (balance >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wallets');
  },
};
