'use strict';

// Metal master (Customization popup: color WHITE/YELLOW/ROSE, purity 14kt/18kt)
module.exports = (sequelize, DataTypes) => {
  const Metal = sequelize.define(
    'Metal',
    {
      id: { type: DataTypes.SMALLINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      metal: { type: DataTypes.ENUM('GOLD', 'PLATINUM', 'SILVER'), allowNull: false },
      purity: { type: DataTypes.STRING(10), allowNull: false }, // 14KT, 18KT, 22KT, 950 ...
      color: { type: DataTypes.ENUM('YELLOW', 'WHITE', 'ROSE', 'NA'), allowNull: false, defaultValue: 'NA' },
      fineness: { type: DataTypes.DECIMAL(5, 3), allowNull: false }, // 0.585 / 0.750 / 0.916
    },
    {
      tableName: 'metals',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'uq_metals', unique: true, fields: ['metal', 'purity', 'color'] }],
    }
  );

  Metal.associate = (models) => {
    Metal.hasMany(models.ProductVariant, { as: 'variants', foreignKey: 'metal_id', onDelete: 'RESTRICT' });
  };

  return Metal;
};
