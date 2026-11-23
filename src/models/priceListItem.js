'use strict';

// B2B (and special B2C) pricing per variant; tiered by quantity for wholesale.
module.exports = (sequelize, DataTypes) => {
  const PriceListItem = sequelize.define(
    'PriceListItem',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      price_list_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      min_qty: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      fixed_price: { type: DataTypes.DECIMAL(14, 2), allowNull: true }, // either fixed price ...
      making_charge_discount_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: true }, // ... or discount on making
      valid_from: { type: DataTypes.DATE, allowNull: true },
      valid_to: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'price_list_items',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'uq_pli', unique: true, fields: ['price_list_id', 'variant_id', 'min_qty'] },
        { name: 'ix_pli_variant', fields: ['variant_id'] },
      ],
    }
  );

  PriceListItem.associate = (models) => {
    PriceListItem.belongsTo(models.PriceList, { as: 'priceList', foreignKey: 'price_list_id', onDelete: 'CASCADE' });
    PriceListItem.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'CASCADE' });
  };

  return PriceListItem;
};
