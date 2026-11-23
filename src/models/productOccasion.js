'use strict';

// Product <-> Occasion (many-to-many)
module.exports = (sequelize, DataTypes) => {
  const ProductOccasion = sequelize.define(
    'ProductOccasion',
    {
      product_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      occasion_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
    },
    {
      tableName: 'product_occasions',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_po_occasion', fields: ['occasion_id'] }],
    }
  );

  ProductOccasion.associate = (models) => {
    ProductOccasion.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductOccasion.belongsTo(models.Occasion, { as: 'occasion', foreignKey: 'occasion_id', onDelete: 'CASCADE' });
  };

  return ProductOccasion;
};
