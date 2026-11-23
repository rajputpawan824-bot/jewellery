'use strict';

// Wishlist (User <-> Product, optionally remembering the chosen variant)
module.exports = (sequelize, DataTypes) => {
  const WishlistItem = sequelize.define(
    'WishlistItem',
    {
      user_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: 'wishlist_items',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'ix_wish_user_time', fields: ['user_id', 'created_at'] },
        { name: 'ix_wish_product', fields: ['product_id'] },
      ],
    }
  );

  WishlistItem.associate = (models) => {
    WishlistItem.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
    WishlistItem.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
    WishlistItem.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'SET NULL' });
  };

  return WishlistItem;
};
