'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    'Cart',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      guest_token: { type: DataTypes.CHAR(36), allowNull: true }, // before login
      business_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      coupon_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      gift_card_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      use_wallet: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      pincode: { type: DataTypes.STRING(12), allowNull: true },
      status: { type: DataTypes.ENUM('ACTIVE', 'CONVERTED', 'ABANDONED'), allowNull: false, defaultValue: 'ACTIVE' },
    },
    {
      tableName: 'carts',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'ix_carts_user', fields: ['user_id', 'status'] },
        { name: 'ix_carts_guest', fields: ['guest_token'] },
        { name: 'ix_carts_abandoned', fields: ['status', 'updated_at'] },
      ],
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
    Cart.belongsTo(models.BusinessAccount, { as: 'businessAccount', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
    Cart.belongsTo(models.Coupon, { as: 'coupon', foreignKey: 'coupon_id', onDelete: 'SET NULL' });
    Cart.belongsTo(models.GiftCard, { as: 'giftCard', foreignKey: 'gift_card_id', onDelete: 'SET NULL' });
    Cart.hasMany(models.CartItem, { as: 'items', foreignKey: 'cart_id', onDelete: 'CASCADE' });
  };

  return Cart;
};
