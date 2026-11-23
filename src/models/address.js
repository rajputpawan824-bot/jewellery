'use strict';

// Address Book (My Account) + checkout shipping address.
// Owned by a user (B2C) or by a business account (B2B shipping/billing locations).
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    'Address',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      business_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      label: { type: DataTypes.STRING(40), allowNull: true }, // Home / Office / Store
      full_name: { type: DataTypes.STRING(150), allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      line1: { type: DataTypes.STRING(200), allowNull: false },
      line2: { type: DataTypes.STRING(200), allowNull: true },
      landmark: { type: DataTypes.STRING(150), allowNull: true },
      city: { type: DataTypes.STRING(100), allowNull: false },
      state: { type: DataTypes.STRING(100), allowNull: true },
      pincode: { type: DataTypes.STRING(12), allowNull: false },
      country_code: { type: DataTypes.CHAR(2), allowNull: false, defaultValue: 'IN' },
      address_type: { type: DataTypes.ENUM('SHIPPING', 'BILLING', 'BOTH'), allowNull: false, defaultValue: 'BOTH' },
      gstin: { type: DataTypes.STRING(15), allowNull: true },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'addresses',
      underscored: true,
      timestamps: true,
      paranoid: true,
      // MySQL can't CHECK columns used by FK cascades, so the owner rule lives here.
      validate: {
        hasOwner() {
          if (this.user_id == null && this.business_account_id == null) {
            throw new Error('Address needs a user_id or a business_account_id');
          }
        },
      },
      indexes: [
        { name: 'ix_addr_user', fields: ['user_id', 'is_default'] },
        { name: 'ix_addr_business', fields: ['business_account_id'] },
        { name: 'ix_addr_pincode', fields: ['pincode'] },
      ],
    }
  );

  Address.associate = (models) => {
    Address.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
    Address.belongsTo(models.BusinessAccount, { as: 'businessAccount', foreignKey: 'business_account_id', onDelete: 'CASCADE' });
  };

  return Address;
};
