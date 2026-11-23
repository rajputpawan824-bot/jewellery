'use strict';

module.exports = (sequelize, DataTypes) => {
  const GiftCardTransaction = sequelize.define(
    'GiftCardTransaction',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      gift_card_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      txn_type: { type: DataTypes.ENUM('ISSUE', 'REDEEM', 'REFUND', 'EXPIRE'), allowNull: false },
      amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      balance_after: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    },
    {
      tableName: 'gift_card_transactions',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'ix_gct_card', fields: ['gift_card_id', 'created_at'] },
        { name: 'ix_gct_order', fields: ['order_id'] },
      ],
    }
  );

  GiftCardTransaction.associate = (models) => {
    GiftCardTransaction.belongsTo(models.GiftCard, { as: 'giftCard', foreignKey: 'gift_card_id', onDelete: 'RESTRICT' });
    GiftCardTransaction.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'RESTRICT' });
  };

  return GiftCardTransaction;
};
