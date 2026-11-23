'use strict';

// Diamond, Emerald, Pearl, Blue Evil Eye ...
module.exports = (sequelize, DataTypes) => {
  const StoneType = sequelize.define(
    'StoneType',
    {
      id: { type: DataTypes.SMALLINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(60), allowNull: false },
      slug: { type: DataTypes.STRING(80), allowNull: false },
    },
    {
      tableName: 'stone_types',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'uq_stone_types_slug', unique: true, fields: ['slug'] }],
    }
  );

  StoneType.associate = (models) => {
    StoneType.hasMany(models.VariantStone, { as: 'variantStones', foreignKey: 'stone_type_id', onDelete: 'RESTRICT' });
  };

  return StoneType;
};
