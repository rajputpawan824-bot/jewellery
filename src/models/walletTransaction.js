'use strict';

// PASSBOOK: Purchased -3,250 / Store Cash Applied +500 / Courtesy ...
// reference_type + reference_id is a polymorphic pointer (ORDER / RETURN / GIFT_CARD / PLAN), no FK.
module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define(
    'WalletTransaction',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      wallet_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      direction: { type: DataTypes.ENUM('CREDIT', 'DEBIT'), allowNull: false },
      amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        validate: {
          isPositive(value) {
            if (Number(value) <= 0) throw new Error('amount must be greater than 0');
          },
        },
      },
      balance_after: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      source: {
        type: DataTypes.ENUM('ORDER_PAYMENT', 'REFUND', 'BUYBACK', 'GIFT_CARD', 'COURTESY', 'CASHBACK', 'PLAN_MATURITY', 'ADJUSTMENT'),
        allowNull: false,
      },
      reference_type: { type: DataTypes.STRING(30), allowNull: true },
      reference_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      description: { type: DataTypes.STRING(255), allowNull: true },
      idempotency_key: { type: DataTypes.STRING(64), allowNull: true },
    },
    {
      tableName: 'wallet_transactions',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'uq_wt_idem', unique: true, fields: ['idempotency_key'] },
        { name: 'ix_wt_wallet_time', fields: ['wallet_id', 'created_at'] },
        { name: 'ix_wt_reference', fields: ['reference_type', 'reference_id'] },
      ],
    }
  );

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.Wallet, { as: 'wallet', foreignKey: 'wallet_id', onDelete: 'RESTRICT' });
  };

  return WalletTransaction;
};
