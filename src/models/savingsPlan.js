'use strict';

// Gold Mine 10 + 1 Monthly Plan (plan definition)
module.exports = (sequelize, DataTypes) => {
  const SavingsPlan = sequelize.define(
    'SavingsPlan',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(40), allowNull: false }, // GOLD_MINE_10_1
      name: { type: DataTypes.STRING(120), allowNull: false },
      installments_count: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 10 },
      bonus_installments: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 1 }, // 100% of one installment
      min_monthly_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 1000 },
      max_monthly_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      grace_days: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 7 },
      redeem_window_days: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 35 },
      making_charge_discount_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      customer_type: { type: DataTypes.ENUM('ALL', 'B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
      terms: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'savings_plans',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'uq_plans_code', unique: true, fields: ['code'] }],
    }
  );

  SavingsPlan.associate = (models) => {
    SavingsPlan.hasMany(models.PlanEnrollment, { as: 'enrollments', foreignKey: 'plan_id', onDelete: 'RESTRICT' });
  };

  return SavingsPlan;
};
