'use strict';

module.exports = (sequelize, DataTypes) => {
  const GiftCard = sequelize.define(
    'GiftCard',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(32), allowNull: false },
      pin_hash: { type: DataTypes.STRING(255), allowNull: true },
      purchaser_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      recipient_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }, // set when credited to recipient's wallet
      recipient_name: { type: DataTypes.STRING(150), allowNull: false },
      recipient_mobile: { type: DataTypes.STRING(20), allowNull: false },
      personal_message: { type: DataTypes.STRING(500), allowNull: true },
      initial_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 500 } },
      balance: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 0 } },
      currency_code: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'INR' },
      delivery_mode: { type: DataTypes.ENUM('INSTANT', 'SCHEDULED'), allowNull: false, defaultValue: 'INSTANT' },
      scheduled_at: { type: DataTypes.DATE, allowNull: true },
      delivered_at: { type: DataTypes.DATE, allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: true },
      status: {
        type: DataTypes.ENUM('PENDING_PAYMENT', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING_PAYMENT',
      },
      purchase_payment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: 'gift_cards',
      underscored: true,
      timestamps: true,
      defaultScope: { attributes: { exclude: ['pin_hash'] } },
      scopes: { withPin: { attributes: { include: ['pin_hash'] } } },
      validate: {
        balanceWithinInitial() {
          if (Number(this.balance) > Number(this.initial_amount)) {
            throw new Error('Gift card balance cannot exceed the initial amount');
          }
        },
      },
      indexes: [
        { name: 'uq_gift_cards_code', unique: true, fields: ['code'] },
        { name: 'ix_gc_purchaser', fields: ['purchaser_user_id', 'created_at'] },
        { name: 'ix_gc_recipient', fields: ['recipient_user_id', 'status'] },
        { name: 'ix_gc_recipient_mobile', fields: ['recipient_mobile'] },
        { name: 'ix_gc_schedule', fields: ['status', 'delivery_mode', 'scheduled_at'] },
      ],
    }
  );

  GiftCard.associate = (models) => {
    GiftCard.belongsTo(models.User, { as: 'purchaser', foreignKey: 'purchaser_user_id', onDelete: 'RESTRICT' });
    GiftCard.belongsTo(models.User, { as: 'recipient', foreignKey: 'recipient_user_id', onDelete: 'RESTRICT' });
    // gift_cards <-> payments reference each other; the FK fk_gc_payment is added by the migration
    // after both tables exist, so Sequelize must not try to create it (constraints: false).
    GiftCard.belongsTo(models.Payment, { as: 'purchasePayment', foreignKey: 'purchase_payment_id', constraints: false });

    GiftCard.hasMany(models.GiftCardTransaction, { as: 'transactions', foreignKey: 'gift_card_id', onDelete: 'RESTRICT' });
    GiftCard.hasMany(models.Payment, { as: 'payments', foreignKey: 'gift_card_id', onDelete: 'RESTRICT' });
    GiftCard.hasMany(models.Cart, { as: 'carts', foreignKey: 'gift_card_id', onDelete: 'SET NULL' });
  };

  return GiftCard;
};
