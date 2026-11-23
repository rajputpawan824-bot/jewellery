'use strict';

const config = require('../config'); // project settings (relative path: sequelize-cli loads models without aliases)

// PAN mandatory for orders >= this amount. The DB CHECK ck_orders_pan uses 200000 too; change both together.
const PAN_THRESHOLD_INR = config.order.panRequiredFromInr;

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_number: { type: DataTypes.STRING(30), allowNull: false }, // BS-9824 / LAT-98234
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      // B2B ready
      customer_type: { type: DataTypes.ENUM('B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
      business_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      price_list_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      po_number: { type: DataTypes.STRING(60), allowNull: true },
      payment_terms_days: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      channel: { type: DataTypes.ENUM('APP', 'WEB', 'STORE'), allowNull: false, defaultValue: 'APP' },
      store_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      status: {
        type: DataTypes.ENUM(
          'PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT',
          'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'
        ),
        allowNull: false,
        defaultValue: 'PENDING_PAYMENT',
      },
      payment_status: {
        type: DataTypes.ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED'),
        allowNull: false,
        defaultValue: 'UNPAID',
      },
      payment_mode: {
        type: DataTypes.ENUM('CARD', 'UPI', 'NET_BANKING', 'WALLET_APP', 'PLAN', 'COD', 'GIFT_CARD', 'STORE_WALLET', 'CREDIT_TERMS'),
        allowNull: true,
      },
      // money
      currency_code: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'INR' },
      subtotal: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      making_charges_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      discount_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      shipping_fee: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      insurance_fee: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      tax_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      grand_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      wallet_amount_used: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      gift_card_amount_used: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      plan_amount_used: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      cod_advance_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 }, // 15% advance for COD
      amount_due: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      coupon_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      coupon_code: { type: DataTypes.STRING(40), allowNull: true },
      plan_enrollment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      // address snapshots (addresses can change later)
      shipping_address: { type: DataTypes.JSON, allowNull: false },
      billing_address: { type: DataTypes.JSON, allowNull: true },
      // KYC
      pan_number: { type: DataTypes.STRING(10), allowNull: true },
      pan_name: { type: DataTypes.STRING(150), allowNull: true },
      pan_document_url: { type: DataTypes.STRING(500), allowNull: true },
      gstin: { type: DataTypes.STRING(15), allowNull: true },
      notes: { type: DataTypes.STRING(500), allowNull: true },
      estimated_delivery_at: { type: DataTypes.DATEONLY, allowNull: true },
      placed_at: { type: DataTypes.DATE, allowNull: true },
      delivered_at: { type: DataTypes.DATE, allowNull: true },
      cancelled_at: { type: DataTypes.DATE, allowNull: true },
      cancel_reason: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: 'orders',
      underscored: true,
      timestamps: true,
      // mirrors CHECK ck_orders_pan so the app gets a readable error before MySQL rejects the row
      validate: {
        panRequiredForHighValue() {
          const needsPan =
            this.currency_code === 'INR' &&
            Number(this.grand_total) >= PAN_THRESHOLD_INR &&
            this.status !== 'PENDING_PAYMENT';
          if (needsPan && !this.pan_number) {
            throw new Error('PAN is required for orders of Rs 2,00,000 or more');
          }
        },
      },
      indexes: [
        { name: 'uq_orders_number', unique: true, fields: ['order_number'] },
        { name: 'ix_orders_user_time', fields: ['user_id', 'placed_at'] },
        { name: 'ix_orders_user_status', fields: ['user_id', 'status'] },
        { name: 'ix_orders_status_time', fields: ['status', 'placed_at'] },
        { name: 'ix_orders_business', fields: ['business_account_id', 'placed_at'] },
        { name: 'ix_orders_coupon', fields: ['coupon_id'] },
        { name: 'ix_orders_plan', fields: ['plan_enrollment_id'] },
      ],
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    Order.belongsTo(models.BusinessAccount, { as: 'businessAccount', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
    Order.belongsTo(models.PriceList, { as: 'priceList', foreignKey: 'price_list_id', onDelete: 'RESTRICT' });
    Order.belongsTo(models.Store, { as: 'store', foreignKey: 'store_id', onDelete: 'RESTRICT' });
    Order.belongsTo(models.Coupon, { as: 'coupon', foreignKey: 'coupon_id', onDelete: 'RESTRICT' });
    Order.belongsTo(models.PlanEnrollment, { as: 'planEnrollment', foreignKey: 'plan_enrollment_id', onDelete: 'RESTRICT' });

    Order.hasMany(models.OrderItem, { as: 'items', foreignKey: 'order_id', onDelete: 'CASCADE' });
    Order.hasMany(models.OrderStatusHistory, { as: 'statusHistory', foreignKey: 'order_id', onDelete: 'CASCADE' });
    Order.hasMany(models.Payment, { as: 'payments', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    Order.hasMany(models.Shipment, { as: 'shipments', foreignKey: 'order_id', onDelete: 'CASCADE' });
    Order.hasMany(models.Refund, { as: 'refunds', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    Order.hasMany(models.AfterSaleRequest, { as: 'afterSaleRequests', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    Order.hasMany(models.AfterSaleRequest, { as: 'exchangeRequests', foreignKey: 'exchange_order_id', onDelete: 'RESTRICT' });
    Order.hasMany(models.GiftCardTransaction, { as: 'giftCardTransactions', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    Order.hasMany(models.CouponRedemption, { as: 'couponRedemptions', foreignKey: 'order_id', onDelete: 'RESTRICT' });
    Order.hasMany(models.SupportTicket, { as: 'supportTickets', foreignKey: 'order_id', onDelete: 'SET NULL' });
    // see PlanEnrollment: FK added by the migration
    Order.hasOne(models.PlanEnrollment, { as: 'redeemedPlanEnrollment', foreignKey: 'redeemed_order_id', constraints: false });
  };

  return Order;
};
