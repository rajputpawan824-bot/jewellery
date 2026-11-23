'use strict';

module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    'CartItem',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      cart_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1, validate: { min: 1 } },
      customization: { type: DataTypes.JSON, allowNull: true }, // {"GOLD_COLOR":"ROSE","GOLD_PURITY":"18KT"}
      customization_hash: { type: DataTypes.CHAR(32), allowNull: false, defaultValue: '' }, // md5(customization)
      gift_message: { type: DataTypes.STRING(500), allowNull: true },
      unit_price_at_add: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      added_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'cart_items',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'uq_cart_line', unique: true, fields: ['cart_id', 'variant_id', 'customization_hash'] },
        { name: 'ix_ci_variant', fields: ['variant_id'] },
      ],
    }
  );

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { as: 'cart', foreignKey: 'cart_id', onDelete: 'CASCADE' });
    CartItem.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'RESTRICT' });
  };

  return CartItem;
};
