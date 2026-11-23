'use strict';

// Images / videos / 360 / AR models; optionally per variant (image per metal colour)
module.exports = (sequelize, DataTypes) => {
  const ProductMedia = sequelize.define(
    'ProductMedia',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      media_type: { type: DataTypes.ENUM('IMAGE', 'VIDEO', '360', 'AR_MODEL'), allowNull: false, defaultValue: 'IMAGE' },
      url: { type: DataTypes.STRING(500), allowNull: false },
      alt_text: { type: DataTypes.STRING(200), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'product_media',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'ix_pm_product', fields: ['product_id', 'sort_order'] },
        { name: 'ix_pm_variant', fields: ['variant_id'] },
      ],
    }
  );

  ProductMedia.associate = (models) => {
    ProductMedia.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductMedia.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'SET NULL' });
  };

  return ProductMedia;
};
