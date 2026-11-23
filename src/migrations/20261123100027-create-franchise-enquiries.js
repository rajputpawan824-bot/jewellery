'use strict';

/**
 * Table: franchise_enquiries (model FranchiseEnquiry)
 * Franchise "Enquire Now" (also the funnel into business_accounts)
 *
 * Primary key: id
 * References: business_accounts
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'franchise_enquiries',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        full_name: { type: Sequelize.STRING(150), allowNull: false },
        email: { type: Sequelize.STRING(190), allowNull: false },
        mobile: { type: Sequelize.STRING(20), allowNull: false },
        city_of_interest: { type: Sequelize.STRING(100), allowNull: false },
        investment_range: { type: Sequelize.STRING(60), allowNull: true },
        message: { type: Sequelize.STRING(1000), allowNull: true },
        status: { type: Sequelize.ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'REJECTED'), allowNull: false, defaultValue: 'NEW' },
        business_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('franchise_enquiries', ['status', 'created_at'], { name: 'ix_fe_status' });
    await queryInterface.addIndex('franchise_enquiries', ['city_of_interest'], { name: 'ix_fe_city' });
    await queryInterface.addIndex('franchise_enquiries', ['mobile'], { name: 'ix_fe_mobile' });
    await queryInterface.addIndex('franchise_enquiries', ['business_account_id'], { name: 'ix_franchise_enquiries_business_account_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('franchise_enquiries', {
      name: 'fk_franchise_enquiries_business_account_id',
      type: 'foreign key',
      fields: ['business_account_id'],
      references: { table: 'business_accounts', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('franchise_enquiries');
  },
};
