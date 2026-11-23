'use strict';

// My Wallet: "Available E-Cash". One per user (B2C) or per business account (B2B credit).
module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define(
    'Wallet',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      business_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      balance: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
      currency_code: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'INR' },
      status: { type: DataTypes.ENUM('ACTIVE', 'FROZEN'), allowNull: false, defaultValue: 'ACTIVE' },
      // optimistic locking: Sequelize bumps this on every save and rejects stale updates
      version: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'wallets',
      underscored: true,
      timestamps: true,
      createdAt: false,
      version: 'version',
      validate: {
        hasOwner() {
          if (this.user_id == null && this.business_account_id == null) {
            throw new Error('Wallet needs a user_id or a business_account_id');
          }
        },
      },
      indexes: [
        { name: 'uq_wallet_user', unique: true, fields: ['user_id'] },
        { name: 'uq_wallet_business', unique: true, fields: ['business_account_id'] },
      ],
    }
  );

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    Wallet.belongsTo(models.BusinessAccount, { as: 'businessAccount', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
    Wallet.hasMany(models.WalletTransaction, { as: 'transactions', foreignKey: 'wallet_id', onDelete: 'RESTRICT' });
  };

  return Wallet;
};
