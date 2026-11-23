'use strict';

// Placed -> Shipped -> In Transit -> Delivered timeline.
// changed_by is the id of whoever made the change (customer, admin or system job); no FK by design.
module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    'OrderStatusHistory',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      from_status: { type: DataTypes.STRING(30), allowNull: true },
      to_status: { type: DataTypes.STRING(30), allowNull: false },
      note: { type: DataTypes.STRING(255), allowNull: true },
      changed_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: 'order_status_history',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [{ name: 'ix_osh_order', fields: ['order_id', 'created_at'] }],
    }
  );

  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'CASCADE' });
  };

  return OrderStatusHistory;
};
