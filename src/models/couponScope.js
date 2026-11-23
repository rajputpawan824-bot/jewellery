'use strict';

// Polymorphic: scope_id points to categories / collections / products depending on scope_type.
// Only coupon_id has a real FK; use getTarget() or the scoped associations on Coupon.
module.exports = (sequelize, DataTypes) => {
  const CouponScope = sequelize.define(
    'CouponScope',
    {
      coupon_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      scope_type: { type: DataTypes.ENUM('CATEGORY', 'COLLECTION', 'PRODUCT'), primaryKey: true, allowNull: false },
      scope_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
    },
    {
      tableName: 'coupon_scopes',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_cs_scope', fields: ['scope_type', 'scope_id'] }],
    }
  );

  CouponScope.associate = (models) => {
    CouponScope.belongsTo(models.Coupon, { as: 'coupon', foreignKey: 'coupon_id', onDelete: 'CASCADE' });
    CouponScope.belongsTo(models.Category, { as: 'category', foreignKey: 'scope_id', constraints: false });
    CouponScope.belongsTo(models.Collection, { as: 'collection', foreignKey: 'scope_id', constraints: false });
    CouponScope.belongsTo(models.Product, { as: 'product', foreignKey: 'scope_id', constraints: false });
  };

  const TARGET_ALIAS = { CATEGORY: 'Category', COLLECTION: 'Collection', PRODUCT: 'Product' };

  // Load the category / collection / product this scope row points to.
  CouponScope.prototype.getTarget = function getTarget(options = {}) {
    const modelName = TARGET_ALIAS[this.scope_type];
    return sequelize.models[modelName].findByPk(this.scope_id, options);
  };

  return CouponScope;
};
