'use strict';

// "Similar designs" / matching sets / upsells (Product <-> Product)
module.exports = (sequelize, DataTypes) => {
  const ProductRelation = sequelize.define(
    'ProductRelation',
    {
      product_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      relation_type: {
        type: DataTypes.ENUM('SIMILAR', 'MATCHING_SET', 'UPSELL'),
        primaryKey: true,
        allowNull: false,
        defaultValue: 'SIMILAR',
      },
      related_product_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'product_relations',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_pr_related', fields: ['related_product_id'] }],
    }
  );

  ProductRelation.associate = (models) => {
    ProductRelation.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductRelation.belongsTo(models.Product, { as: 'relatedProduct', foreignKey: 'related_product_id', onDelete: 'CASCADE' });
  };

  return ProductRelation;
};
