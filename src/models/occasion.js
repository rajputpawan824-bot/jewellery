'use strict';

// "Gifts for Every Chapter": Anniversary, Engagement, Weddings, Festivals, For Mothers
module.exports = (sequelize, DataTypes) => {
  const Occasion = sequelize.define(
    'Occasion',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(80), allowNull: false },
      slug: { type: DataTypes.STRING(100), allowNull: false },
      tagline: { type: DataTypes.STRING(150), allowNull: true },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'occasions',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'uq_occasions_slug', unique: true, fields: ['slug'] }],
    }
  );

  Occasion.associate = (models) => {
    Occasion.hasMany(models.ProductOccasion, { as: 'productOccasions', foreignKey: 'occasion_id', onDelete: 'CASCADE' });
    Occasion.belongsToMany(models.Product, {
      as: 'products',
      through: models.ProductOccasion,
      foreignKey: 'occasion_id',
      otherKey: 'product_id',
    });
  };

  return Occasion;
};
