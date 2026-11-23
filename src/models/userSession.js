'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define(
    'UserSession',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      refresh_token_hash: { type: DataTypes.CHAR(64), allowNull: false },
      device_id: { type: DataTypes.STRING(100), allowNull: true },
      device_type: { type: DataTypes.ENUM('ANDROID', 'IOS', 'WEB'), allowNull: true },
      push_token: { type: DataTypes.STRING(255), allowNull: true },
      ip_address: { type: DataTypes.STRING(45), allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revoked_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'user_sessions',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'uq_session_token', unique: true, fields: ['refresh_token_hash'] },
        { name: 'ix_session_user', fields: ['user_id', 'revoked_at'] },
      ],
    }
  );

  UserSession.associate = (models) => {
    UserSession.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return UserSession;
};
