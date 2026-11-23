'use strict';

// Compare popup (Product 1 vs Product 2). Kept server-side so it syncs across devices.
module.exports = (sequelize, DataTypes) => {
  const CompareItem = sequelize.define(
    'CompareItem',
    {
      user_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
    },
    {
      tableName: 'compare_items',
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  CompareItem.associate = (models) => {
    CompareItem.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
    CompareItem.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'CASCADE' });
  };

  return CompareItem;
};
