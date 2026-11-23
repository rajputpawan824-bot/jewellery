'use strict';

// Warehouses, boutiques and (B2B) franchise stores
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define(
    'Store',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(30), allowNull: false },
      name: { type: DataTypes.STRING(150), allowNull: false },
      store_type: { type: DataTypes.ENUM('WAREHOUSE', 'BOUTIQUE', 'FRANCHISE'), allowNull: false },
      business_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }, // franchise owner (B2B)
      phone: { type: DataTypes.STRING(20), allowNull: true },
      line1: { type: DataTypes.STRING(200), allowNull: true },
      city: { type: DataTypes.STRING(100), allowNull: false },
      state: { type: DataTypes.STRING(100), allowNull: true },
      pincode: { type: DataTypes.STRING(12), allowNull: true },
      country_code: { type: DataTypes.CHAR(2), allowNull: false, defaultValue: 'IN' },
      latitude: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
      longitude: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'stores',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'uq_stores_code', unique: true, fields: ['code'] },
        { name: 'ix_stores_city', fields: ['city', 'store_type', 'is_active'] },
      ],
    }
  );

  Store.associate = (models) => {
    Store.belongsTo(models.BusinessAccount, { as: 'businessAccount', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });

    Store.hasMany(models.Inventory, { as: 'inventory', foreignKey: 'store_id', onDelete: 'RESTRICT' });
    Store.belongsToMany(models.ProductVariant, {
      as: 'variants',
      through: models.Inventory,
      foreignKey: 'store_id',
      otherKey: 'variant_id',
    });

    Store.hasMany(models.Order, { as: 'orders', foreignKey: 'store_id', onDelete: 'RESTRICT' });
    Store.hasMany(models.Shipment, { as: 'shipments', foreignKey: 'from_store_id', onDelete: 'RESTRICT' });
    Store.hasMany(models.AfterSaleRequest, { as: 'dropOffRequests', foreignKey: 'drop_off_store_id', onDelete: 'RESTRICT' });
    Store.hasMany(models.Appointment, { as: 'appointments', foreignKey: 'store_id', onDelete: 'RESTRICT' });
  };

  return Store;
};
