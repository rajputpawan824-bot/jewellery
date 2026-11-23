'use strict';

// "Book a Session" - in store, video call or home visit
module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define(
    'Appointment',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      full_name: { type: DataTypes.STRING(150), allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: true, validate: { isEmail: true } },
      interest: {
        type: DataTypes.ENUM('BRIDAL', 'ENGAGEMENT', 'DAILY_WEAR', 'CUSTOM_DESIGN', 'GIFTING', 'OTHER'),
        allowNull: false,
        defaultValue: 'BRIDAL',
      },
      mode: { type: DataTypes.ENUM('IN_STORE', 'VIDEO_CALL', 'HOME_VISIT'), allowNull: false, defaultValue: 'IN_STORE' },
      store_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      scheduled_at: { type: DataTypes.DATE, allowNull: true },
      status: {
        type: DataTypes.ENUM('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
        allowNull: false,
        defaultValue: 'REQUESTED',
      },
      notes: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'appointments',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'ix_appt_user', fields: ['user_id', 'scheduled_at'] },
        { name: 'ix_appt_store_slot', fields: ['store_id', 'scheduled_at'] },
        { name: 'ix_appt_status', fields: ['status', 'created_at'] },
        { name: 'ix_appt_phone', fields: ['phone'] },
      ],
    }
  );

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'SET NULL' });
    Appointment.belongsTo(models.Store, { as: 'store', foreignKey: 'store_id', onDelete: 'RESTRICT' });
    Appointment.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'SET NULL' });
  };

  return Appointment;
};
