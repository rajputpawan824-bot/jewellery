'use strict';

module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define(
    'Refund',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      payment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      destination: { type: DataTypes.ENUM('WALLET', 'BANK_ACCOUNT', 'ORIGINAL_SOURCE', 'GIFT_CARD'), allowNull: false },
      amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      gateway_refund_id: { type: DataTypes.STRING(100), allowNull: true },
      status: { type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'), allowNull: false, defaultValue: 'PENDING' },
      processed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'refunds',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'ix_refunds_order', fields: ['order_id'] },
        { name: 'ix_refunds_request', fields: ['request_id'] },
        { name: 'ix_refunds_status', fields: ['status', 'created_at'] },
      ],
    }
  );

  Refund.associate = (models) => {
    Refund.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    Refund.belongsTo(models.AfterSaleRequest, { as: 'request', foreignKey: 'request_id', onDelete: 'RESTRICT' });
    Refund.belongsTo(models.Payment, { as: 'payment', foreignKey: 'payment_id', onDelete: 'RESTRICT' });
  };

  return Refund;
};
