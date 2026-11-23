'use strict';

/**
 * Table: orders (model Order)
 *
 * Primary key: id
 * References: users, business_accounts, price_lists, stores, coupons, plan_enrollments
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'orders',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        order_number: { type: Sequelize.STRING(30), allowNull: false },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        customer_type: { type: Sequelize.ENUM('B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
        business_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        price_list_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        po_number: { type: Sequelize.STRING(60), allowNull: true },
        payment_terms_days: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        channel: { type: Sequelize.ENUM('APP', 'WEB', 'STORE'), allowNull: false, defaultValue: 'APP' },
        store_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        status: { type: Sequelize.ENUM('PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'), allowNull: false, defaultValue: 'PENDING_PAYMENT' },
        payment_status: { type: Sequelize.ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED'), allowNull: false, defaultValue: 'UNPAID' },
        payment_mode: { type: Sequelize.ENUM('CARD', 'UPI', 'NET_BANKING', 'WALLET_APP', 'PLAN', 'COD', 'GIFT_CARD', 'STORE_WALLET', 'CREDIT_TERMS'), allowNull: true },
        currency_code: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'INR' },
        subtotal: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        making_charges_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        discount_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        shipping_fee: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        insurance_fee: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        tax_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        grand_total: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        wallet_amount_used: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        gift_card_amount_used: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        plan_amount_used: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        cod_advance_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        amount_due: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        coupon_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        coupon_code: { type: Sequelize.STRING(40), allowNull: true },
        plan_enrollment_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        shipping_address: { type: Sequelize.JSON, allowNull: false },
        billing_address: { type: Sequelize.JSON, allowNull: true },
        pan_number: { type: Sequelize.STRING(10), allowNull: true },
        pan_name: { type: Sequelize.STRING(150), allowNull: true },
        pan_document_url: { type: Sequelize.STRING(500), allowNull: true },
        gstin: { type: Sequelize.STRING(15), allowNull: true },
        notes: { type: Sequelize.STRING(500), allowNull: true },
        estimated_delivery_at: { type: Sequelize.DATEONLY, allowNull: true },
        placed_at: { type: Sequelize.DATE, allowNull: true },
        delivered_at: { type: Sequelize.DATE, allowNull: true },
        cancelled_at: { type: Sequelize.DATE, allowNull: true },
        cancel_reason: { type: Sequelize.STRING(255), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('orders', ['order_number'], { name: 'uq_orders_number', unique: true });
    await queryInterface.addIndex('orders', ['user_id', 'placed_at'], { name: 'ix_orders_user_time' });
    await queryInterface.addIndex('orders', ['user_id', 'status'], { name: 'ix_orders_user_status' });
    await queryInterface.addIndex('orders', ['status', 'placed_at'], { name: 'ix_orders_status_time' });
    await queryInterface.addIndex('orders', ['business_account_id', 'placed_at'], { name: 'ix_orders_business' });
    await queryInterface.addIndex('orders', ['coupon_id'], { name: 'ix_orders_coupon' });
    await queryInterface.addIndex('orders', ['plan_enrollment_id'], { name: 'ix_orders_plan' });
    await queryInterface.addIndex('orders', ['price_list_id'], { name: 'ix_orders_price_list_id' }); // FK lookup
    await queryInterface.addIndex('orders', ['store_id'], { name: 'ix_orders_store_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('orders', {
      name: 'fk_orders_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('orders', {
      name: 'fk_orders_business_account_id',
      type: 'foreign key',
      fields: ['business_account_id'],
      references: { table: 'business_accounts', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('orders', {
      name: 'fk_orders_price_list_id',
      type: 'foreign key',
      fields: ['price_list_id'],
      references: { table: 'price_lists', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('orders', {
      name: 'fk_orders_store_id',
      type: 'foreign key',
      fields: ['store_id'],
      references: { table: 'stores', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('orders', {
      name: 'fk_orders_coupon_id',
      type: 'foreign key',
      fields: ['coupon_id'],
      references: { table: 'coupons', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('orders', {
      name: 'fk_orders_plan_enrollment_id',
      type: 'foreign key',
      fields: ['plan_enrollment_id'],
      references: { table: 'plan_enrollments', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `orders` ADD CONSTRAINT `ck_orders_amounts` CHECK (subtotal >= 0 AND grand_total >= 0 AND discount_total >= 0 AND amount_due >= 0)'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE `orders` ADD CONSTRAINT `ck_orders_pan` CHECK (NOT (currency_code = \'INR\' AND grand_total >= 200000 AND status <> \'PENDING_PAYMENT\' AND pan_number IS NULL))'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
