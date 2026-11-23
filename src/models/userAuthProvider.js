'use strict';

// "Or sign in with Google / Apple"
module.exports = (sequelize, DataTypes) => {
  const UserAuthProvider = sequelize.define(
    'UserAuthProvider',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      provider: { type: DataTypes.ENUM('GOOGLE', 'APPLE'), allowNull: false },
      provider_user_id: { type: DataTypes.STRING(191), allowNull: false },
    },
    {
      tableName: 'user_auth_providers',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'uq_provider_identity', unique: true, fields: ['provider', 'provider_user_id'] },
        { name: 'ix_uap_user', fields: ['user_id'] },
      ],
    }
  );

  UserAuthProvider.associate = (models) => {
    UserAuthProvider.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return UserAuthProvider;
};
