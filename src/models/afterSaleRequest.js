'use strict';

// Return Order / Buy Back / Exchange, with pickup and payout details
module.exports = (sequelize, DataTypes) => {
  const AfterSaleRequest = sequelize.define(
    'AfterSaleRequest',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      request_number: { type: DataTypes.STRING(30), allowNull: false },
      request_type: { type: DataTypes.ENUM('RETURN', 'EXCHANGE', 'BUYBACK'), allowNull: false },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      order_item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      reason: {
        type: DataTypes.ENUM('SIZE_FIT', 'CHANGED_MIND', 'DAMAGED', 'NOT_AS_DESCRIBED', 'UPGRADE', 'OTHER'),
        allowNull: true,
      },
      reason_note: { type: DataTypes.STRING(500), allowNull: true },
      pickup_method: { type: DataTypes.ENUM('COURIER_PICKUP', 'BOUTIQUE_DROP_OFF'), allowNull: false },
      drop_off_store_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      pickup_address: { type: DataTypes.JSON, allowNull: true },
      estimated_value: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      final_value: { type: DataTypes.DECIMAL(14, 2), allowNull: true }, // after quality check
      deduction_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      payout_method: {
        type: DataTypes.ENUM('WALLET', 'BANK_ACCOUNT', 'ORIGINAL_SOURCE', 'EXCHANGE_ORDER'),
        allowNull: true,
      },
      bank_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      exchange_order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      status: {
        type: DataTypes.ENUM('REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'RECEIVED', 'QUALITY_CHECK', 'COMPLETED', 'REJECTED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'REQUESTED',
      },
      qc_notes: { type: DataTypes.STRING(500), allowNull: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'after_sale_requests',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'uq_asr_number', unique: true, fields: ['request_number'] },
        { name: 'ix_asr_user', fields: ['user_id', 'created_at'] },
        { name: 'ix_asr_order_item', fields: ['order_item_id'] },
        { name: 'ix_asr_status', fields: ['request_type', 'status', 'created_at'] },
      ],
    }
  );

  AfterSaleRequest.associate = (models) => {
    AfterSaleRequest.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    AfterSaleRequest.belongsTo(models.OrderItem, { as: 'orderItem', foreignKey: 'order_item_id', onDelete: 'RESTRICT' });
    AfterSaleRequest.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    AfterSaleRequest.belongsTo(models.Store, { as: 'dropOffStore', foreignKey: 'drop_off_store_id', onDelete: 'RESTRICT' });
    AfterSaleRequest.belongsTo(models.UserBankAccount, { as: 'bankAccount', foreignKey: 'bank_account_id', onDelete: 'RESTRICT' });
    AfterSaleRequest.belongsTo(models.Order, { as: 'exchangeOrder', foreignKey: 'exchange_order_id', onDelete: 'RESTRICT' });
    AfterSaleRequest.hasMany(models.Refund, { as: 'refunds', foreignKey: 'request_id', onDelete: 'RESTRICT' });
  };

  return AfterSaleRequest;
};
