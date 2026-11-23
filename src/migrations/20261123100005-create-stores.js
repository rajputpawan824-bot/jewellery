'use strict';

/**
 * Table: stores (model Store)
 * Warehouses, boutiques and (B2B) franchise stores
 *
 * Primary key: id
 * References: business_accounts
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'stores',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        code: { type: Sequelize.STRING(30), allowNull: false },
        name: { type: Sequelize.STRING(150), allowNull: false },
        store_type: { type: Sequelize.ENUM('WAREHOUSE', 'BOUTIQUE', 'FRANCHISE'), allowNull: false },
        business_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        phone: { type: Sequelize.STRING(20), allowNull: true },
        line1: { type: Sequelize.STRING(200), allowNull: true },
        city: { type: Sequelize.STRING(100), allowNull: false },
        state: { type: Sequelize.STRING(100), allowNull: true },
        pincode: { type: Sequelize.STRING(12), allowNull: true },
        country_code: { type: Sequelize.CHAR(2), allowNull: false, defaultValue: 'IN' },
        latitude: { type: Sequelize.DECIMAL(9, 6), allowNull: true },
        longitude: { type: Sequelize.DECIMAL(9, 6), allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('stores', ['code'], { name: 'uq_stores_code', unique: true });
    await queryInterface.addIndex('stores', ['city', 'store_type', 'is_active'], { name: 'ix_stores_city' });
    await queryInterface.addIndex('stores', ['business_account_id'], { name: 'ix_stores_business_account_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('stores', {
      name: 'fk_stores_business_account_id',
      type: 'foreign key',
      fields: ['business_account_id'],
      references: { table: 'business_accounts', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stores');
  },
};
