'use strict';

// Which order lines (and how many) went in a shipment (Shipment <-> OrderItem)
module.exports = (sequelize, DataTypes) => {
  const ShipmentItem = sequelize.define(
    'ShipmentItem',
    {
      shipment_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      order_item_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    },
    {
      tableName: 'shipment_items',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_si_order_item', fields: ['order_item_id'] }],
    }
  );

  ShipmentItem.associate = (models) => {
    ShipmentItem.belongsTo(models.Shipment, { as: 'shipment', foreignKey: 'shipment_id', onDelete: 'CASCADE' });
    ShipmentItem.belongsTo(models.OrderItem, { as: 'orderItem', foreignKey: 'order_item_id', onDelete: 'CASCADE' });
  };

  return ShipmentItem;
};
