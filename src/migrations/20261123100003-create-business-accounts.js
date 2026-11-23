'use strict';

/**
 * Table: business_accounts (model BusinessAccount)
 * B2B customer (retailer, wholesaler, franchise, corporate gifting).
 *
 * Primary key: id
 * References: price_lists
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'business_accounts',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        legal_name: { type: Sequelize.STRING(200), allowNull: false },
        trade_name: { type: Sequelize.STRING(200), allowNull: true },
        gstin: { type: Sequelize.STRING(15), allowNull: true },
        pan_number: { type: Sequelize.STRING(10), allowNull: true },
        business_type: { type: Sequelize.ENUM('RETAILER', 'WHOLESALER', 'FRANCHISE', 'CORPORATE_GIFTING', 'OTHER'), allowNull: false, defaultValue: 'RETAILER' },
        price_list_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        credit_limit: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        payment_terms_days: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        status: { type: Sequelize.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'), allowNull: false, defaultValue: 'PENDING' },
        verified_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('business_accounts', ['gstin'], { name: 'uq_business_gstin', unique: true });
    await queryInterface.addIndex('business_accounts', ['status'], { name: 'ix_business_status' });
    await queryInterface.addIndex('business_accounts', ['price_list_id'], { name: 'ix_business_price_list' });

    // Foreign keys
    await queryInterface.addConstraint('business_accounts', {
      name: 'fk_business_accounts_price_list_id',
      type: 'foreign key',
      fields: ['price_list_id'],
      references: { table: 'price_lists', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `business_accounts` ADD CONSTRAINT `ck_ba_credit` CHECK (credit_limit >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('business_accounts');
  },
};
