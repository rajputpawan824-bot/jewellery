'use strict';

// Price lists: RETAIL (default B2C) now; WHOLESALE / tiered lists for B2B later.
module.exports = (sequelize, DataTypes) => {
  const PriceList = sequelize.define(
    'PriceList',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(40), allowNull: false },
      name: { type: DataTypes.STRING(120), allowNull: false },
      customer_type: { type: DataTypes.ENUM('B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
      currency_code: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'INR' },
      making_charge_discount_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      valid_from: { type: DataTypes.DATE, allowNull: true },
      valid_to: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'price_lists',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'uq_price_lists_code', unique: true, fields: ['code'] },
        { name: 'ix_price_lists_type_active', fields: ['customer_type', 'is_active'] },
      ],
    }
  );

  PriceList.associate = (models) => {
    PriceList.hasMany(models.BusinessAccount, { as: 'businessAccounts', foreignKey: 'price_list_id', onDelete: 'RESTRICT' });
    PriceList.hasMany(models.User, { as: 'users', foreignKey: 'price_list_id', onDelete: 'RESTRICT' });
    PriceList.hasMany(models.PriceListItem, { as: 'items', foreignKey: 'price_list_id', onDelete: 'CASCADE' });
    PriceList.hasMany(models.Order, { as: 'orders', foreignKey: 'price_list_id', onDelete: 'RESTRICT' });
  };

  return PriceList;
};
