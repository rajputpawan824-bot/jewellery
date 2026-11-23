'use strict';

// Daily metal rate used to compute the metal value in the price break-up.
// Keyed by (metal, purity) - the same pair as metals.metal / metals.purity - not by FK,
// because one rate applies to every colour of that purity.
module.exports = (sequelize, DataTypes) => {
  const MetalRate = sequelize.define(
    'MetalRate',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      metal: { type: DataTypes.ENUM('GOLD', 'PLATINUM', 'SILVER'), allowNull: false },
      purity: { type: DataTypes.STRING(10), allowNull: false },
      rate_per_gram: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      currency_code: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'INR' },
      effective_from: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: 'metal_rates',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        {
          name: 'ix_metal_rates_latest',
          fields: ['metal', 'purity', { name: 'effective_from', order: 'DESC' }],
        },
      ],
    }
  );

  return MetalRate;
};
