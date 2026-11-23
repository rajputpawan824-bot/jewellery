'use strict';

/**
 * Table: business_account_users (model BusinessAccountUser)
 * B2B: which users can buy on behalf of a business, and with what role.
 *
 * Primary key: business_account_id, user_id
 * References: business_accounts, users
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'business_account_users',
      {
        business_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        role: { type: Sequelize.ENUM('OWNER', 'ADMIN', 'BUYER', 'VIEWER'), allowNull: false, defaultValue: 'BUYER' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('business_account_users', ['user_id'], { name: 'ix_bau_user' });

    // Foreign keys
    await queryInterface.addConstraint('business_account_users', {
      name: 'fk_business_account_users_business_account_id',
      type: 'foreign key',
      fields: ['business_account_id'],
      references: { table: 'business_accounts', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('business_account_users', {
      name: 'fk_business_account_users_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('business_account_users');
  },
};
