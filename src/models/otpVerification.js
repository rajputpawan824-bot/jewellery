'use strict';

// Sign up / login / forgot PIN OTPs (6 digit, resend in 30s).
// Looked up by mobile number, so it has no FK to users (the user may not exist yet).
module.exports = (sequelize, DataTypes) => {
  const OtpVerification = sequelize.define(
    'OtpVerification',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      country_code: { type: DataTypes.STRING(5), allowNull: false, defaultValue: '+91' },
      mobile: { type: DataTypes.STRING(15), allowNull: false },
      purpose: {
        type: DataTypes.ENUM('SIGNUP', 'LOGIN', 'RESET_PIN', 'VERIFY_EMAIL', 'VERIFY_MOBILE'),
        allowNull: false,
      },
      otp_hash: { type: DataTypes.STRING(255), allowNull: false },
      attempts: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      consumed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'otp_verifications',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { name: 'ix_otp_lookup', fields: ['country_code', 'mobile', 'purpose', 'created_at'] },
        { name: 'ix_otp_expires', fields: ['expires_at'] },
      ],
    }
  );

  return OtpVerification;
};
