'use strict';

// Customization popup: which options a product allows (metal colour, purity, engraving ...)
module.exports = (sequelize, DataTypes) => {
  const ProductCustomizationOption = sequelize.define(
    'ProductCustomizationOption',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      option_key: { type: DataTypes.STRING(40), allowNull: false }, // GOLD_COLOR, GOLD_PURITY, ENGRAVING, BAND
      option_label: { type: DataTypes.STRING(80), allowNull: false },
      allowed_values: { type: DataTypes.JSON, allowNull: true }, // ["WHITE","YELLOW","ROSE"]
      extra_charge: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      is_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'product_customization_options',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'uq_pco', unique: true, fields: ['product_id', 'option_key'] }],
    }
  );

  ProductCustomizationOption.associate = (models) => {
    ProductCustomizationOption.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
  };

  return ProductCustomizationOption;
};
