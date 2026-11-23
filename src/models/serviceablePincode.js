'use strict';

// "Select PIN CODE" -> "Expected delivery date", COD availability.
// Lookup table: addresses / carts store the pincode as text, so there is no FK.
module.exports = (sequelize, DataTypes) => {
  const ServiceablePincode = sequelize.define(
    'ServiceablePincode',
    {
      pincode: { type: DataTypes.STRING(12), primaryKey: true, allowNull: false },
      city: { type: DataTypes.STRING(100), allowNull: true },
      state: { type: DataTypes.STRING(100), allowNull: true },
      delivery_days: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 5 },
      cod_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'serviceable_pincodes',
      underscored: true,
      timestamps: false,
    }
  );

  return ServiceablePincode;
};
