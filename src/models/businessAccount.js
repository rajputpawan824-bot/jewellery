'use strict';

// B2B customer (retailer, wholesaler, franchise, corporate gifting).
module.exports = (sequelize, DataTypes) => {
  const BusinessAccount = sequelize.define(
    'BusinessAccount',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      legal_name: { type: DataTypes.STRING(200), allowNull: false },
      trade_name: { type: DataTypes.STRING(200), allowNull: true },
      gstin: { type: DataTypes.STRING(15), allowNull: true },
      pan_number: { type: DataTypes.STRING(10), allowNull: true },
      business_type: {
        type: DataTypes.ENUM('RETAILER', 'WHOLESALER', 'FRANCHISE', 'CORPORATE_GIFTING', 'OTHER'),
        allowNull: false,
        defaultValue: 'RETAILER',
      },
      price_list_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      credit_limit: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      payment_terms_days: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      verified_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'business_accounts',
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        { name: 'uq_business_gstin', unique: true, fields: ['gstin'] },
        { name: 'ix_business_status', fields: ['status'] },
        { name: 'ix_business_price_list', fields: ['price_list_id'] },
      ],
    }
  );

  BusinessAccount.associate = (models) => {
    BusinessAccount.belongsTo(models.PriceList, { as: 'priceList', foreignKey: 'price_list_id', onDelete: 'RESTRICT' });

    BusinessAccount.hasMany(models.BusinessAccountUser, { as: 'memberships', foreignKey: 'business_account_id', onDelete: 'CASCADE' });
    BusinessAccount.belongsToMany(models.User, {
      as: 'members',
      through: models.BusinessAccountUser,
      foreignKey: 'business_account_id',
      otherKey: 'user_id',
    });

    BusinessAccount.hasMany(models.Address, { as: 'addresses', foreignKey: 'business_account_id', onDelete: 'CASCADE' });
    BusinessAccount.hasMany(models.Store, { as: 'stores', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
    BusinessAccount.hasOne(models.Wallet, { as: 'wallet', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
    BusinessAccount.hasMany(models.Cart, { as: 'carts', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
    BusinessAccount.hasMany(models.Order, { as: 'orders', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
    BusinessAccount.hasMany(models.FranchiseEnquiry, { as: 'franchiseEnquiries', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
  };

  return BusinessAccount;
};
