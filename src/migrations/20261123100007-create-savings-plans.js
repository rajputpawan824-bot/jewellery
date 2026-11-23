'use strict';

/**
 * Table: savings_plans (model SavingsPlan)
 * Gold Mine 10 + 1 Monthly Plan (plan definition)
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'savings_plans',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        code: { type: Sequelize.STRING(40), allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        installments_count: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 10 },
        bonus_installments: { type: Sequelize.DECIMAL(4, 2), allowNull: false, defaultValue: 1 },
        min_monthly_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 1000 },
        max_monthly_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        grace_days: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 7 },
        redeem_window_days: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 35 },
        making_charge_discount_pct: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
        customer_type: { type: Sequelize.ENUM('ALL', 'B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
        terms: { type: Sequelize.TEXT, allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('savings_plans', ['code'], { name: 'uq_plans_code', unique: true });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `savings_plans` ADD CONSTRAINT `ck_sp_values` CHECK (installments_count >= 1 AND min_monthly_amount > 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('savings_plans');
  },
};
