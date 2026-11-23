'use strict';

/**
 * Table: plan_enrollments (model PlanEnrollment)
 * A customer's subscription to a savings plan
 *
 * Primary key: id
 * References: savings_plans, users
 * Circular FKs (redeemed_order_id) are added in the add-circular-foreign-keys migration.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'plan_enrollments',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        enrollment_no: { type: Sequelize.STRING(30), allowNull: false },
        plan_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        mobile: { type: Sequelize.STRING(20), allowNull: false },
        monthly_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        installments_paid: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        total_paid: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        bonus_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        next_due_date: { type: Sequelize.DATEONLY, allowNull: true },
        maturity_date: { type: Sequelize.DATEONLY, allowNull: false },
        autopay_mandate_id: { type: Sequelize.STRING(100), allowNull: true },
        status: { type: Sequelize.ENUM('ACTIVE', 'MATURED', 'REDEEMED', 'DEFAULTED', 'CANCELLED'), allowNull: false, defaultValue: 'ACTIVE' },
        redeemed_order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        redeemed_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('plan_enrollments', ['enrollment_no'], { name: 'uq_pe_no', unique: true });
    await queryInterface.addIndex('plan_enrollments', ['user_id', 'status'], { name: 'ix_pe_user' });
    await queryInterface.addIndex('plan_enrollments', ['status', 'next_due_date'], { name: 'ix_pe_due' });
    await queryInterface.addIndex('plan_enrollments', ['mobile'], { name: 'ix_pe_mobile' });
    await queryInterface.addIndex('plan_enrollments', ['plan_id'], { name: 'ix_plan_enrollments_plan_id' }); // FK lookup
    await queryInterface.addIndex('plan_enrollments', ['redeemed_order_id'], { name: 'ix_plan_enrollments_redeemed_order_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('plan_enrollments', {
      name: 'fk_plan_enrollments_plan_id',
      type: 'foreign key',
      fields: ['plan_id'],
      references: { table: 'savings_plans', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('plan_enrollments', {
      name: 'fk_plan_enrollments_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `plan_enrollments` ADD CONSTRAINT `ck_pe_amounts` CHECK (monthly_amount > 0 AND total_paid >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('plan_enrollments');
  },
};
