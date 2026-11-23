'use strict';

// Stock per variant per store (ProductVariant <-> Store)
module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    'Inventory',
    {
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      store_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      qty_on_hand: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
      qty_reserved: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    },
    {
      tableName: 'inventory',
      underscored: true,
      timestamps: true,
      createdAt: false,
      indexes: [{ name: 'ix_inventory_store', fields: ['store_id'] }],
    }
  );

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'CASCADE' });
    Inventory.belongsTo(models.Store, { as: 'store', foreignKey: 'store_id', onDelete: 'RESTRICT' });
  };

  return Inventory;
};
