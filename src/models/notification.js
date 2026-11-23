'use strict';

// Notification screen. reference_type + reference_id is a polymorphic pointer, no FK.
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      category: {
        type: DataTypes.ENUM('ORDERS', 'OFFERS', 'PLAN', 'WALLET', 'APPOINTMENTS', 'GENERAL'),
        allowNull: false,
      },
      title: { type: DataTypes.STRING(150), allowNull: false },
      body: { type: DataTypes.STRING(500), allowNull: false },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      deep_link: { type: DataTypes.STRING(300), allowNull: true }, // app://coupon/SUMMER20
      reference_type: { type: DataTypes.STRING(30), allowNull: true },
      reference_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      read_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'notifications',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'ix_notif_user_time', fields: ['user_id', 'created_at'] },
        { name: 'ix_notif_user_unread', fields: ['user_id', 'is_read', 'created_at'] },
      ],
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return Notification;
};
