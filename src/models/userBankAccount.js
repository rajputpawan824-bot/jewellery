'use strict';

// Bank account for refunds / buyback payouts ("Credit amount to Bank Account")
module.exports = (sequelize, DataTypes) => {
  const UserBankAccount = sequelize.define(
    'UserBankAccount',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      account_holder: { type: DataTypes.STRING(150), allowNull: false },
      // encrypted at app level; VARBINARY(255) in the SQL schema
      account_number_enc: { type: DataTypes.BLOB, allowNull: false },
      account_last4: { type: DataTypes.CHAR(4), allowNull: false },
      ifsc: { type: DataTypes.STRING(11), allowNull: false },
      bank_name: { type: DataTypes.STRING(120), allowNull: true },
      is_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'user_bank_accounts',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      paranoid: true,
      defaultScope: { attributes: { exclude: ['account_number_enc'] } },
      scopes: { withAccountNumber: { attributes: { include: ['account_number_enc'] } } },
      indexes: [{ name: 'ix_uba_user', fields: ['user_id'] }],
    }
  );

  UserBankAccount.associate = (models) => {
    UserBankAccount.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
    UserBankAccount.hasMany(models.AfterSaleRequest, { as: 'afterSaleRequests', foreignKey: 'bank_account_id', onDelete: 'RESTRICT' });
  };

  return UserBankAccount;
};
