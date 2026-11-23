'use strict';

// Order line. Product details are snapshotted at purchase time (catalog may change).
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      product_name: { type: DataTypes.STRING(200), allowNull: false },
      sku: { type: DataTypes.STRING(60), allowNull: false },
      metal_desc: { type: DataTypes.STRING(60), allowNull: true }, // "18kt Rose Gold"
      stone_desc: { type: DataTypes.STRING(150), allowNull: true }, // "VVS1 Clarity, E Color, 0.75 Ct"
      size_label: { type: DataTypes.STRING(20), allowNull: true },
      certification: { type: DataTypes.STRING(60), allowNull: true }, // "IGI Certified"
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      customization: { type: DataTypes.JSON, allowNull: true },
      gift_message: { type: DataTypes.STRING(500), allowNull: true },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      gold_weight_g: { type: DataTypes.DECIMAL(9, 3), allowNull: true },
      metal_rate_per_g: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      metal_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      stone_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      making_charges: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      unit_price: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      line_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'EXCHANGED', 'BOUGHT_BACK'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
    },
    {
      tableName: 'order_items',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'ix_oi_order', fields: ['order_id'] },
        { name: 'ix_oi_variant', fields: ['variant_id'] },
        { name: 'ix_oi_product', fields: ['product_id'] },
      ],
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'CASCADE' });
    OrderItem.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'RESTRICT' });
    OrderItem.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'RESTRICT' });

    OrderItem.hasOne(models.Review, { as: 'review', foreignKey: 'order_item_id', onDelete: 'SET NULL' });
    OrderItem.hasMany(models.ShipmentItem, { as: 'shipmentItems', foreignKey: 'order_item_id', onDelete: 'CASCADE' });
    OrderItem.belongsToMany(models.Shipment, {
      as: 'shipments',
      through: models.ShipmentItem,
      foreignKey: 'order_item_id',
      otherKey: 'shipment_id',
    });
    OrderItem.hasMany(models.AfterSaleRequest, { as: 'afterSaleRequests', foreignKey: 'order_item_id', onDelete: 'RESTRICT' });
  };

  return OrderItem;
};
