'use strict';

/**
 * Table: users (model User)
 * Customer account (Create Account, Sign In, OTP, PIN, Personal Info).
 *
 * Primary key: id
 * References: price_lists
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'users',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        full_name: { type: Sequelize.STRING(150), allowNull: false },
        country_code: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '+91' },
        mobile: { type: Sequelize.STRING(15), allowNull: false },
        mobile_verified_at: { type: Sequelize.DATE, allowNull: true },
        email: { type: Sequelize.STRING(190), allowNull: true },
        email_verified_at: { type: Sequelize.DATE, allowNull: true },
        pin_hash: { type: Sequelize.STRING(255), allowNull: true },
        date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
        gender: { type: Sequelize.ENUM('FEMALE', 'MALE', 'PREFER_NOT_TO_SAY'), allowNull: true },
        avatar_url: { type: Sequelize.STRING(500), allowNull: true },
        customer_type: { type: Sequelize.ENUM('B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
        price_list_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        status: { type: Sequelize.ENUM('ACTIVE', 'BLOCKED', 'DELETED'), allowNull: false, defaultValue: 'ACTIVE' },
        terms_accepted_at: { type: Sequelize.DATE, allowNull: true },
        last_login_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('users', ['country_code', 'mobile'], { name: 'uq_users_mobile', unique: true });
    await queryInterface.addIndex('users', ['email'], { name: 'uq_users_email', unique: true });
    await queryInterface.addIndex('users', ['customer_type', 'status'], { name: 'ix_users_type_status' });
    await queryInterface.addIndex('users', ['created_at'], { name: 'ix_users_created' });
    await queryInterface.addIndex('users', ['price_list_id'], { name: 'ix_users_price_list_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('users', {
      name: 'fk_users_price_list_id',
      type: 'foreign key',
      fields: ['price_list_id'],
      references: { table: 'price_lists', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
