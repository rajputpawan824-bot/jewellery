'use strict';

// "Shop by Collections": Heritage, Exquisite, Celestial ...
module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define(
    'Collection',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      slug: { type: DataTypes.STRING(140), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      banner_url: { type: DataTypes.STRING(500), allowNull: true },
      is_featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'collections',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'uq_collections_slug', unique: true, fields: ['slug'] },
        { name: 'ix_collections_featured', fields: ['is_active', 'is_featured', 'sort_order'] },
      ],
    }
  );

  Collection.associate = (models) => {
    Collection.hasMany(models.ProductCollection, { as: 'productCollections', foreignKey: 'collection_id', onDelete: 'CASCADE' });
    Collection.belongsToMany(models.Product, {
      as: 'products',
      through: models.ProductCollection,
      foreignKey: 'collection_id',
      otherKey: 'product_id',
    });

    Collection.belongsToMany(models.Coupon, {
      as: 'coupons',
      through: { model: models.CouponScope, scope: { scope_type: 'COLLECTION' }, unique: false },
      foreignKey: 'scope_id',
      otherKey: 'coupon_id',
      constraints: false,
    });
  };

  return Collection;
};
