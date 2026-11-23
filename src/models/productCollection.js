'use strict';

// Product <-> Collection (many-to-many)
module.exports = (sequelize, DataTypes) => {
  const ProductCollection = sequelize.define(
    'ProductCollection',
    {
      product_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      collection_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'product_collections',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_pc_collection', fields: ['collection_id', 'sort_order'] }],
    }
  );

  ProductCollection.associate = (models) => {
    ProductCollection.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductCollection.belongsTo(models.Collection, { as: 'collection', foreignKey: 'collection_id', onDelete: 'CASCADE' });
  };

  return ProductCollection;
};
