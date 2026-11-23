'use strict';

// Franchise "Enquire Now" (also the funnel into business_accounts)
module.exports = (sequelize, DataTypes) => {
  const FranchiseEnquiry = sequelize.define(
    'FranchiseEnquiry',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      full_name: { type: DataTypes.STRING(150), allowNull: false },
      email: { type: DataTypes.STRING(190), allowNull: false, validate: { isEmail: true } },
      mobile: { type: DataTypes.STRING(20), allowNull: false },
      city_of_interest: { type: DataTypes.STRING(100), allowNull: false },
      investment_range: { type: DataTypes.STRING(60), allowNull: true },
      message: { type: DataTypes.STRING(1000), allowNull: true },
      status: {
        type: DataTypes.ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'NEW',
      },
      business_account_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }, // set when converted
    },
    {
      tableName: 'franchise_enquiries',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'ix_fe_status', fields: ['status', 'created_at'] },
        { name: 'ix_fe_city', fields: ['city_of_interest'] },
        { name: 'ix_fe_mobile', fields: ['mobile'] },
      ],
    }
  );

  FranchiseEnquiry.associate = (models) => {
    FranchiseEnquiry.belongsTo(models.BusinessAccount, { as: 'businessAccount', foreignKey: 'business_account_id', onDelete: 'RESTRICT' });
  };

  return FranchiseEnquiry;
};
