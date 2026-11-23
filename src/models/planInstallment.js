'use strict';

// One row per monthly installment (1..10)
module.exports = (sequelize, DataTypes) => {
  const PlanInstallment = sequelize.define(
    'PlanInstallment',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      enrollment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      installment_no: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
      due_date: { type: DataTypes.DATEONLY, allowNull: false },
      amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      paid_at: { type: DataTypes.DATE, allowNull: true },
      payment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      status: { type: DataTypes.ENUM('DUE', 'PAID', 'OVERDUE', 'WAIVED'), allowNull: false, defaultValue: 'DUE' },
    },
    {
      tableName: 'plan_installments',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'uq_pi', unique: true, fields: ['enrollment_id', 'installment_no'] },
        { name: 'ix_pi_due', fields: ['status', 'due_date'] },
      ],
    }
  );

  PlanInstallment.associate = (models) => {
    PlanInstallment.belongsTo(models.PlanEnrollment, { as: 'enrollment', foreignKey: 'enrollment_id', onDelete: 'CASCADE' });
    // plan_installments <-> payments reference each other; fk_pi_payment is added by the migration.
    PlanInstallment.belongsTo(models.Payment, { as: 'payment', foreignKey: 'payment_id', constraints: false });
    PlanInstallment.hasMany(models.Payment, { as: 'paymentAttempts', foreignKey: 'plan_installment_id', onDelete: 'RESTRICT' });
  };

  return PlanInstallment;
};
