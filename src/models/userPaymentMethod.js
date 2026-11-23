'use strict';

// Saved cards / UPI (gateway tokens only, never PAN/CVV) - "Visa ending 4242"
module.exports = (sequelize, DataTypes) => {
  const UserPaymentMethod = sequelize.define(
    'UserPaymentMethod',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      method_type: { type: DataTypes.ENUM('CARD', 'UPI'), allowNull: false, defaultValue: 'CARD' },
      gateway: { type: DataTypes.STRING(40), allowNull: false },
      gateway_token: { type: DataTypes.STRING(255), allowNull: false },
      card_brand: { type: DataTypes.STRING(20), allowNull: true },
      card_last4: { type: DataTypes.CHAR(4), allowNull: true },
      card_holder: { type: DataTypes.STRING(150), allowNull: true },
      expiry_month: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true, validate: { min: 1, max: 12 } },
      expiry_year: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
      upi_vpa: { type: DataTypes.STRING(100), allowNull: true },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'user_payment_methods',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      paranoid: true,
      indexes: [
        { name: 'uq_upm_token', unique: true, fields: ['gateway', 'gateway_token'] },
        { name: 'ix_upm_user', fields: ['user_id', 'is_default'] },
      ],
    }
  );

  UserPaymentMethod.associate = (models) => {
    UserPaymentMethod.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
    UserPaymentMethod.hasMany(models.Payment, { as: 'payments', foreignKey: 'user_payment_method_id', onDelete: 'SET NULL' });
  };

  return UserPaymentMethod;
};
