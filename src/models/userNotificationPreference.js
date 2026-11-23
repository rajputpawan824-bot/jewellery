'use strict';

// Notification Preferences + "Communication Preference: Email, SMS, Push"
module.exports = (sequelize, DataTypes) => {
  const UserNotificationPreference = sequelize.define(
    'UserNotificationPreference',
    {
      user_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      channel: { type: DataTypes.ENUM('EMAIL', 'SMS', 'PUSH', 'WHATSAPP'), primaryKey: true, allowNull: false },
      category: {
        type: DataTypes.ENUM('ORDERS', 'OFFERS', 'PLAN', 'WALLET', 'APPOINTMENTS', 'GENERAL'),
        primaryKey: true,
        allowNull: false,
      },
      is_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'user_notification_preferences',
      underscored: true,
      timestamps: true,
      createdAt: false,
    }
  );

  UserNotificationPreference.associate = (models) => {
    UserNotificationPreference.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return UserNotificationPreference;
};
