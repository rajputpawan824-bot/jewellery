'use strict';

// Help & Support / "Contact Customer Care" / Jewelry Concierge chat
module.exports = (sequelize, DataTypes) => {
  const SupportTicket = sequelize.define(
    'SupportTicket',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      channel: { type: DataTypes.ENUM('CHAT', 'CALL', 'EMAIL', 'APP'), allowNull: false, defaultValue: 'APP' },
      subject: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'), allowNull: false, defaultValue: 'OPEN' },
    },
    {
      tableName: 'support_tickets',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'ix_st_user', fields: ['user_id', 'created_at'] },
        { name: 'ix_st_status', fields: ['status', 'created_at'] },
        { name: 'ix_st_order', fields: ['order_id'] },
      ],
    }
  );

  SupportTicket.associate = (models) => {
    SupportTicket.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'SET NULL' });
    SupportTicket.belongsTo(models.Order, { as: 'order', foreignKey: 'order_id', onDelete: 'SET NULL' });
  };

  return SupportTicket;
};
