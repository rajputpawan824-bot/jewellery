'use strict';

/**
 * Table: plan_installments (model PlanInstallment)
 * One row per monthly installment (1..10)
 *
 * Primary key: id
 * References: plan_enrollments
 * Circular FKs (payment_id) are added in the add-circular-foreign-keys migration.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'plan_installments',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        enrollment_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        installment_no: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
        due_date: { type: Sequelize.DATEONLY, allowNull: false },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        paid_at: { type: Sequelize.DATE, allowNull: true },
        payment_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        status: { type: Sequelize.ENUM('DUE', 'PAID', 'OVERDUE', 'WAIVED'), allowNull: false, defaultValue: 'DUE' },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('plan_installments', ['enrollment_id', 'installment_no'], { name: 'uq_pi', unique: true });
    await queryInterface.addIndex('plan_installments', ['status', 'due_date'], { name: 'ix_pi_due' });
    await queryInterface.addIndex('plan_installments', ['payment_id'], { name: 'ix_plan_installments_payment_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('plan_installments', {
      name: 'fk_plan_installments_enrollment_id',
      type: 'foreign key',
      fields: ['enrollment_id'],
      references: { table: 'plan_enrollments', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `plan_installments` ADD CONSTRAINT `ck_pi_amount` CHECK (amount > 0 AND installment_no >= 1)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('plan_installments');
  },
};
