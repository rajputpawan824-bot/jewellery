'use strict';

// Who used which coupon on which order (per-user limits)
module.exports = (sequelize, DataTypes) => {
  const CouponRedemption = sequelize.define(
    'CouponRedemption',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      coupon_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      discount_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    },
    {
      tableName: 'coupon_redemptions',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'uq_cr_order_coupon', unique: true, fields: ['order_id', 'coupon_id'] },
        { name: 'ix_cr_coupon_user', fields: ['coupon_id', 'user_id'] },
      ],
    }
  );

  CouponRedemption.associate = (models) => {
    CouponRedemption.belongsTo(models.Coupon, { as: 'coupon', foreignKey: 'coupon_id', onDelete: 'RESTRICT' });
    CouponRedemption.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    CouponRedemption.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'RESTRICT' });
  };

  return CouponRedemption;
};
