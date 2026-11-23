'use strict';

// Rings, Earrings, Necklaces, Mangalsutra, Amulets ... (self-referencing tree)
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      parent_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      slug: { type: DataTypes.STRING(140), allowNull: false },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'categories',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'uq_categories_slug', unique: true, fields: ['slug'] },
        { name: 'ix_categories_parent', fields: ['parent_id', 'is_active', 'sort_order'] },
      ],
    }
  );

  Category.associate = (models) => {
    Category.belongsTo(models.Category, { as: 'parent', foreignKey: 'parent_id', onDelete: 'RESTRICT' });
    Category.hasMany(models.Category, { as: 'children', foreignKey: 'parent_id', onDelete: 'RESTRICT' });
    Category.hasMany(models.Product, { as: 'products', foreignKey: 'category_id', onDelete: 'RESTRICT' });

    // coupon_scopes is polymorphic (scope_type + scope_id), so no DB-level FK on scope_id
    Category.belongsToMany(models.Coupon, {
      as: 'coupons',
      through: { model: models.CouponScope, scope: { scope_type: 'CATEGORY' }, unique: false },
      foreignKey: 'scope_id',
      otherKey: 'coupon_id',
      constraints: false,
    });
  };

  return Category;
};
