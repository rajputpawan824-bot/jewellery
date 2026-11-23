'use strict';

// Free-form tags: #trending, bridal, daily-wear ...
module.exports = (sequelize, DataTypes) => {
  const ProductTag = sequelize.define(
    'ProductTag',
    {
      product_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      tag: { type: DataTypes.STRING(60), primaryKey: true, allowNull: false },
    },
    {
      tableName: 'product_tags',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_pt_tag', fields: ['tag'] }],
    }
  );

  ProductTag.associate = (models) => {
    ProductTag.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
  };

  return ProductTag;
};
