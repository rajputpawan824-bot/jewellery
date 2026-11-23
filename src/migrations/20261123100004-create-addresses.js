'use strict';

/**
 * Table: addresses (model Address)
 * Address Book (My Account) + checkout shipping address.
 * Owned by a user (B2C) or by a business account (B2B shipping/billing locations).
 *
 * Primary key: id
 * References: users, business_accounts
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'addresses',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        business_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        label: { type: Sequelize.STRING(40), allowNull: true },
        full_name: { type: Sequelize.STRING(150), allowNull: false },
        phone: { type: Sequelize.STRING(20), allowNull: false },
        line1: { type: Sequelize.STRING(200), allowNull: false },
        line2: { type: Sequelize.STRING(200), allowNull: true },
        landmark: { type: Sequelize.STRING(150), allowNull: true },
        city: { type: Sequelize.STRING(100), allowNull: false },
        state: { type: Sequelize.STRING(100), allowNull: true },
        pincode: { type: Sequelize.STRING(12), allowNull: false },
        country_code: { type: Sequelize.CHAR(2), allowNull: false, defaultValue: 'IN' },
        address_type: { type: Sequelize.ENUM('SHIPPING', 'BILLING', 'BOTH'), allowNull: false, defaultValue: 'BOTH' },
        gstin: { type: Sequelize.STRING(15), allowNull: true },
        is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('addresses', ['user_id', 'is_default'], { name: 'ix_addr_user' });
    await queryInterface.addIndex('addresses', ['business_account_id'], { name: 'ix_addr_business' });
    await queryInterface.addIndex('addresses', ['pincode'], { name: 'ix_addr_pincode' });

    // Foreign keys
    await queryInterface.addConstraint('addresses', {
      name: 'fk_addresses_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('addresses', {
      name: 'fk_addresses_business_account_id',
      type: 'foreign key',
      fields: ['business_account_id'],
      references: { table: 'business_accounts', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('addresses');
  },
};
