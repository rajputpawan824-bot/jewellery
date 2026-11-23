'use strict';

// Stones in a variant: "9 SI IJ Diamonds", "VVS1 Clarity, E Color", "Blue Evil Eye"
module.exports = (sequelize, DataTypes) => {
  const VariantStone = sequelize.define(
    'VariantStone',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      stone_type_id: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
      shape: { type: DataTypes.STRING(40), allowNull: true }, // Round, Emerald Cut
      clarity: { type: DataTypes.STRING(20), allowNull: true }, // VVS1, SI
      color_grade: { type: DataTypes.STRING(20), allowNull: true }, // E, IJ
      setting: { type: DataTypes.STRING(40), allowNull: true }, // hand-set, prong
      stone_count: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
      total_carat: { type: DataTypes.DECIMAL(9, 3), allowNull: true },
      amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'variant_stones',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'ix_vs_variant', fields: ['variant_id'] },
        { name: 'ix_vs_stone_filter', fields: ['stone_type_id', 'variant_id'] },
      ],
    }
  );

  VariantStone.associate = (models) => {
    VariantStone.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'CASCADE' });
    VariantStone.belongsTo(models.StoneType, { as: 'stoneType', foreignKey: 'stone_type_id', onDelete: 'RESTRICT' });
  };

  return VariantStone;
};
