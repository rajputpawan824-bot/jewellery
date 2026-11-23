'use strict';

// Product (design). The sellable unit is ProductVariant.
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_code: { type: DataTypes.STRING(40), allowNull: false }, // "008245-4714201"
      name: { type: DataTypes.STRING(200), allowNull: false }, // "Solitaire Grace"
      slug: { type: DataTypes.STRING(220), allowNull: false },
      short_description: { type: DataTypes.STRING(500), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      category_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      gender: { type: DataTypes.ENUM('WOMEN', 'MEN', 'UNISEX', 'KIDS'), allowNull: false, defaultValue: 'WOMEN' },
      // badges & promises shown on the product page
      is_customizable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_plan_eligible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, // "Fit IN plan"
      has_virtual_tryon: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_returnable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      return_window_days: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 30 },
      lifetime_buyback: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      lifetime_exchange: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_bis_hallmarked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      // denormalised for fast listing / sorting (kept in sync by app/job)
      min_price: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      max_price: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      avg_rating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      review_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      popularity_score: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      is_trending: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_exclusive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      status: {
        type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED'),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      meta_title: { type: DataTypes.STRING(200), allowNull: true },
      meta_description: { type: DataTypes.STRING(400), allowNull: true },
    },
    {
      tableName: 'products',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        { name: 'uq_products_code', unique: true, fields: ['product_code'] },
        { name: 'uq_products_slug', unique: true, fields: ['slug'] },
        { name: 'ix_products_cat_price', fields: ['category_id', 'status', 'min_price'] },
        { name: 'ix_products_cat_new', fields: ['category_id', 'status', 'created_at'] },
        { name: 'ix_products_cat_pop', fields: ['category_id', 'status', 'popularity_score'] },
        { name: 'ix_products_gender', fields: ['status', 'gender', 'min_price'] },
        { name: 'ix_products_trending', fields: ['status', 'is_trending', 'popularity_score'] },
        { name: 'ft_products_search', type: 'FULLTEXT', fields: ['name', 'short_description', 'description'] },
      ],
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { as: 'category', foreignKey: 'category_id', onDelete: 'RESTRICT' });

    // merchandising
    Product.hasMany(models.ProductCollection, { as: 'productCollections', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Product.belongsToMany(models.Collection, {
      as: 'collections',
      through: models.ProductCollection,
      foreignKey: 'product_id',
      otherKey: 'collection_id',
    });
    Product.hasMany(models.ProductOccasion, { as: 'productOccasions', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Product.belongsToMany(models.Occasion, {
      as: 'occasions',
      through: models.ProductOccasion,
      foreignKey: 'product_id',
      otherKey: 'occasion_id',
    });
    Product.hasMany(models.ProductTag, { as: 'tags', foreignKey: 'product_id', onDelete: 'CASCADE' });

    // "Similar designs" (self many-to-many)
    Product.hasMany(models.ProductRelation, { as: 'relations', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Product.hasMany(models.ProductRelation, { as: 'relatedBy', foreignKey: 'related_product_id', onDelete: 'CASCADE' });
    Product.belongsToMany(models.Product, {
      as: 'relatedProducts',
      through: { model: models.ProductRelation, unique: false },
      foreignKey: 'product_id',
      otherKey: 'related_product_id',
    });

    // sellable units & content
    Product.hasMany(models.ProductVariant, { as: 'variants', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Product.hasMany(models.ProductMedia, { as: 'media', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Product.hasMany(models.ProductCustomizationOption, { as: 'customizationOptions', foreignKey: 'product_id', onDelete: 'CASCADE' });

    // engagement
    Product.hasMany(models.WishlistItem, { as: 'wishlistItems', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Product.belongsToMany(models.User, {
      as: 'wishlistedBy',
      through: models.WishlistItem,
      foreignKey: 'product_id',
      otherKey: 'user_id',
    });
    Product.hasMany(models.RecentlyViewed, { as: 'recentViews', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Product.hasMany(models.Review, { as: 'reviews', foreignKey: 'product_id', onDelete: 'CASCADE' });

    // sales & services
    Product.hasMany(models.OrderItem, { as: 'orderItems', foreignKey: 'product_id', onDelete: 'RESTRICT' });
    Product.hasMany(models.Appointment, { as: 'appointments', foreignKey: 'product_id', onDelete: 'SET NULL' });

    Product.belongsToMany(models.Coupon, {
      as: 'coupons',
      through: { model: models.CouponScope, scope: { scope_type: 'PRODUCT' }, unique: false },
      foreignKey: 'scope_id',
      otherKey: 'coupon_id',
      constraints: false,
    });
  };

  return Product;
};
