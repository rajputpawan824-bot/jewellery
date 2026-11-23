'use strict';

// Sellable unit = product + metal/purity/color + size  (SKU "14YGEE-01")
module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    'ProductVariant',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      sku: { type: DataTypes.STRING(60), allowNull: false },
      metal_id: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
      size_label: { type: DataTypes.STRING(20), allowNull: true }, // ring size 5..9, "52 (L 12)"
      gold_weight_g: { type: DataTypes.DECIMAL(9, 3), allowNull: true },
      stone_weight_ct: { type: DataTypes.DECIMAL(9, 3), allowNull: true },
      gross_weight_g: { type: DataTypes.DECIMAL(9, 3), allowNull: true },
      height_mm: { type: DataTypes.DECIMAL(7, 2), allowNull: true },
      width_mm: { type: DataTypes.DECIMAL(7, 2), allowNull: true },
      length_mm: { type: DataTypes.DECIMAL(7, 2), allowNull: true },
      // price break-up (View More Details): metal + stone + making + GST
      metal_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      stone_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      making_charges: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      other_charges: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      tax_rate_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 3.0 },
      tax_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      mrp: { type: DataTypes.DECIMAL(14, 2), allowNull: false }, // inclusive of all taxes
      currency_code: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'INR' },
      price_updated_at: { type: DataTypes.DATE, allowNull: true },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_made_to_order: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      lead_time_days: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
    },
    {
      tableName: 'product_variants',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'uq_variants_sku', unique: true, fields: ['sku'] },
        { name: 'uq_variants_combo', unique: true, fields: ['product_id', 'metal_id', 'size_label'] },
        { name: 'ix_variants_product', fields: ['product_id', 'status', 'is_default'] },
        { name: 'ix_variants_metal_price', fields: ['metal_id', 'status', 'mrp'] },
        { name: 'ix_variants_price', fields: ['status', 'mrp'] },
      ],
    }
  );

  ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductVariant.belongsTo(models.Metal, { as: 'metal', foreignKey: 'metal_id', onDelete: 'RESTRICT' });

    ProductVariant.hasMany(models.VariantStone, { as: 'stones', foreignKey: 'variant_id', onDelete: 'CASCADE' });
    ProductVariant.hasMany(models.VariantCertification, { as: 'certifications', foreignKey: 'variant_id', onDelete: 'CASCADE' });
    ProductVariant.hasMany(models.ProductMedia, { as: 'media', foreignKey: 'variant_id', onDelete: 'SET NULL' });
    ProductVariant.hasMany(models.PriceListItem, { as: 'priceListItems', foreignKey: 'variant_id', onDelete: 'CASCADE' });

    // stock per store
    ProductVariant.hasMany(models.Inventory, { as: 'inventory', foreignKey: 'variant_id', onDelete: 'CASCADE' });
    ProductVariant.belongsToMany(models.Store, {
      as: 'stores',
      through: models.Inventory,
      foreignKey: 'variant_id',
      otherKey: 'store_id',
    });

    ProductVariant.hasMany(models.WishlistItem, { as: 'wishlistItems', foreignKey: 'variant_id', onDelete: 'SET NULL' });
    ProductVariant.hasMany(models.CompareItem, { as: 'compareItems', foreignKey: 'variant_id', onDelete: 'CASCADE' });
    ProductVariant.hasMany(models.CartItem, { as: 'cartItems', foreignKey: 'variant_id', onDelete: 'RESTRICT' });
    ProductVariant.hasMany(models.OrderItem, { as: 'orderItems', foreignKey: 'variant_id', onDelete: 'RESTRICT' });
  };

  return ProductVariant;
};
