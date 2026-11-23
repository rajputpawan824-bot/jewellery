'use strict';

// A customer's subscription to a savings plan
module.exports = (sequelize, DataTypes) => {
  const PlanEnrollment = sequelize.define(
    'PlanEnrollment',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      enrollment_no: { type: DataTypes.STRING(30), allowNull: false },
      plan_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      mobile: { type: DataTypes.STRING(20), allowNull: false },
      monthly_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      installments_paid: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      total_paid: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      bonus_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 }, // 11th month value
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      next_due_date: { type: DataTypes.DATEONLY, allowNull: true },
      maturity_date: { type: DataTypes.DATEONLY, allowNull: false },
      autopay_mandate_id: { type: DataTypes.STRING(100), allowNull: true },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'MATURED', 'REDEEMED', 'DEFAULTED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      redeemed_order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      redeemed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'plan_enrollments',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'uq_pe_no', unique: true, fields: ['enrollment_no'] },
        { name: 'ix_pe_user', fields: ['user_id', 'status'] },
        { name: 'ix_pe_due', fields: ['status', 'next_due_date'] },
        { name: 'ix_pe_mobile', fields: ['mobile'] },
      ],
    }
  );

  PlanEnrollment.associate = (models) => {
    PlanEnrollment.belongsTo(models.SavingsPlan, { as: 'plan', foreignKey: 'plan_id', onDelete: 'RESTRICT' });
    PlanEnrollment.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    // orders <-> plan_enrollments reference each other; fk_pe_redeemed_order is added by the migration.
    PlanEnrollment.belongsTo(models.Order, { as: 'redeemedOrder', foreignKey: 'redeemed_order_id', constraints: false });

    PlanEnrollment.hasMany(models.PlanInstallment, { as: 'installments', foreignKey: 'enrollment_id', onDelete: 'CASCADE' });
    PlanEnrollment.hasMany(models.Order, { as: 'orders', foreignKey: 'plan_enrollment_id', onDelete: 'RESTRICT' });
  };

  return PlanEnrollment;
};
