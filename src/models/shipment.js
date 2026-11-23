'use strict';

module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define(
    'Shipment',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      from_store_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      carrier: { type: DataTypes.STRING(60), allowNull: true },
      tracking_number: { type: DataTypes.STRING(80), allowNull: true },
      tracking_url: { type: DataTypes.STRING(500), allowNull: true },
      is_insured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      insured_value: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      status: {
        type: DataTypes.ENUM('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO', 'LOST'),
        allowNull: false,
        defaultValue: 'CREATED',
      },
      shipped_at: { type: DataTypes.DATE, allowNull: true },
      delivered_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'shipments',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'ix_ship_order', fields: ['order_id'] },
        { name: 'ix_ship_tracking', fields: ['carrier', 'tracking_number'] },
        { name: 'ix_ship_status', fields: ['status', 'shipped_at'] },
      ],
    }
  );

  Shipment.associate = (models) => {
    Shipment.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'CASCADE' });
    Shipment.belongsTo(models.Store, { as: 'fromStore', foreignKey: 'from_store_id', onDelete: 'RESTRICT' });

    Shipment.hasMany(models.ShipmentItem, { as: 'items', foreignKey: 'shipment_id', onDelete: 'CASCADE' });
    Shipment.belongsToMany(models.OrderItem, {
      as: 'orderItems',
      through: models.ShipmentItem,
      foreignKey: 'shipment_id',
      otherKey: 'order_item_id',
    });
  };

  return Shipment;
};
