'use strict';

// One order can have many payments: COD advance + balance, wallet + card,
// plan installments, gift card purchase, wallet top-up.
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      purpose: { type: DataTypes.ENUM('ORDER', 'PLAN_INSTALLMENT', 'GIFT_CARD', 'WALLET_TOPUP'), allowNull: false },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      plan_installment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      gift_card_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      method: {
        type: DataTypes.ENUM('CARD', 'UPI', 'NET_BANKING', 'APPLE_PAY', 'GOOGLE_PAY', 'WALLET', 'GIFT_CARD', 'PLAN', 'COD', 'BANK_TRANSFER'),
        allowNull: false,
      },
      user_payment_method_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      gateway: { type: DataTypes.STRING(40), allowNull: true },
      gateway_order_id: { type: DataTypes.STRING(100), allowNull: true },
      gateway_payment_id: { type: DataTypes.STRING(100), allowNull: true },
      bank_code: { type: DataTypes.STRING(40), allowNull: true }, // Net banking: HSBC, Barclays...
      amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      currency_code: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'INR' },
      status: {
        type: DataTypes.ENUM('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'),
        allowNull: false,
        defaultValue: 'INITIATED',
      },
      failure_reason: { type: DataTypes.STRING(255), allowNull: true },
      gateway_response: { type: DataTypes.JSON, allowNull: true },
      paid_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'payments',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'uq_payments_gateway', unique: true, fields: ['gateway', 'gateway_payment_id'] },
        { name: 'ix_payments_order', fields: ['order_id'] },
        { name: 'ix_payments_installment', fields: ['plan_installment_id'] },
        { name: 'ix_payments_giftcard', fields: ['gift_card_id'] },
        { name: 'ix_payments_user_time', fields: ['user_id', 'created_at'] },
        { name: 'ix_payments_status_time', fields: ['status', 'created_at'] },
        { name: 'ix_payments_gateway_order', fields: ['gateway_order_id'] },
      ],
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    Payment.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    Payment.belongsTo(models.PlanInstallment, { as: 'planInstallment', foreignKey: 'plan_installment_id', onDelete: 'RESTRICT' });
    Payment.belongsTo(models.GiftCard, { as: 'giftCard', foreignKey: 'gift_card_id', onDelete: 'RESTRICT' });
    Payment.belongsTo(models.UserPaymentMethod, { as: 'paymentMethod', foreignKey: 'user_payment_method_id', onDelete: 'SET NULL' });

    Payment.hasMany(models.Refund, { as: 'refunds', foreignKey: 'payment_id', onDelete: 'RESTRICT' });
    // reverse side of the two circular references (FKs added by the migration)
    Payment.hasOne(models.GiftCard, { as: 'purchasedGiftCard', foreignKey: 'purchase_payment_id', constraints: false });
    Payment.hasOne(models.PlanInstallment, { as: 'settledInstallment', foreignKey: 'payment_id', constraints: false });
  };

  return Payment;
};
