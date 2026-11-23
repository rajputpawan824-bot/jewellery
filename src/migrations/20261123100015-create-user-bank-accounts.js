'use strict';

/**
 * Table: user_bank_accounts (model UserBankAccount)
 * Bank account for refunds / buyback payouts ("Credit amount to Bank Account")
 *
 * Primary key: id
 * References: users
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'user_bank_accounts',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        account_holder: { type: Sequelize.STRING(150), allowNull: false },
        account_number_enc: { type: Sequelize.BLOB, allowNull: false },
        account_last4: { type: Sequelize.CHAR(4), allowNull: false },
        ifsc: { type: Sequelize.STRING(11), allowNull: false },
        bank_name: { type: Sequelize.STRING(120), allowNull: true },
        is_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('user_bank_accounts', ['user_id'], { name: 'ix_uba_user' });

    // Foreign keys
    await queryInterface.addConstraint('user_bank_accounts', {
      name: 'fk_user_bank_accounts_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_bank_accounts');
  },
};
