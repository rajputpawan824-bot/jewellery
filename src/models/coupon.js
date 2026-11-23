'use strict';

// SUMMER10/15/20/30 "x% off on Making Charges"; also auto offers shown as product labels.
module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    'Coupon',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(40), allowNull: false },
      title: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.STRING(500), allowNull: true },
      discount_type: { type: DataTypes.ENUM('PERCENT', 'FLAT'), allowNull: false },
      discount_value: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      applies_on: {
        type: DataTypes.ENUM('MAKING_CHARGES', 'ORDER_SUBTOTAL', 'METAL_VALUE', 'STONE_VALUE'),
        allowNull: false,
        defaultValue: 'MAKING_CHARGES',
      },
      max_discount: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      min_order_value: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      customer_type: { type: DataTypes.ENUM('ALL', 'B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
      is_auto_apply: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // label, no code needed
      is_public: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, // listed under "Other Offers"
      usage_limit_total: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      usage_limit_per_user: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      used_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      starts_at: { type: DataTypes.DATE, allowNull: false },
      ends_at: { type: DataTypes.DATE, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'coupons',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'uq_coupons_code', unique: true, fields: ['code'] },
        { name: 'ix_coupons_live', fields: ['is_active', 'is_public', 'customer_type', 'starts_at', 'ends_at'] },
      ],
    }
  );

  Coupon.associate = (models) => {
    // optional scope: coupon only for some categories / collections / products
    Coupon.hasMany(models.CouponScope, { as: 'scopes', foreignKey: 'coupon_id', onDelete: 'CASCADE' });
    const scoped = (scopeType) => ({
      through: { model: models.CouponScope, scope: { scope_type: scopeType }, unique: false },
      foreignKey: 'coupon_id',
      otherKey: 'scope_id',
      constraints: false,
    });
    Coupon.belongsToMany(models.Category, { as: 'scopedCategories', ...scoped('CATEGORY') });
    Coupon.belongsToMany(models.Collection, { as: 'scopedCollections', ...scoped('COLLECTION') });
    Coupon.belongsToMany(models.Product, { as: 'scopedProducts', ...scoped('PRODUCT') });

    Coupon.hasMany(models.Cart, { as: 'carts', foreignKey: 'coupon_id', onDelete: 'SET NULL' });
    Coupon.hasMany(models.Order, { as: 'orders', foreignKey: 'coupon_id', onDelete: 'RESTRICT' });
    Coupon.hasMany(models.CouponRedemption, { as: 'redemptions', foreignKey: 'coupon_id', onDelete: 'RESTRICT' });
    Coupon.hasMany(models.Banner, { as: 'banners', foreignKey: 'coupon_id', onDelete: 'SET NULL' });
  };

  return Coupon;
};
