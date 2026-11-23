'use strict';

// B2B: which users can buy on behalf of a business, and with what role.
module.exports = (sequelize, DataTypes) => {
  const BusinessAccountUser = sequelize.define(
    'BusinessAccountUser',
    {
      business_account_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      role: { type: DataTypes.ENUM('OWNER', 'ADMIN', 'BUYER', 'VIEWER'), allowNull: false, defaultValue: 'BUYER' },
    },
    {
      tableName: 'business_account_users',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [{ name: 'ix_bau_user', fields: ['user_id'] }],
    }
  );

  BusinessAccountUser.associate = (models) => {
    BusinessAccountUser.belongsTo(models.BusinessAccount, { as: 'businessAccount', foreignKey: 'business_account_id', onDelete: 'CASCADE' });
    BusinessAccountUser.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return BusinessAccountUser;
};
