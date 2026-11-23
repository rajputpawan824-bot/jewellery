'use strict';

/**
 * Table: otp_verifications (model OtpVerification)
 * Sign up / login / forgot PIN OTPs (6 digit, resend in 30s).
 * Looked up by mobile number, so it has no FK to users (the user may not exist yet).
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'otp_verifications',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        country_code: { type: Sequelize.STRING(5), allowNull: false, defaultValue: '+91' },
        mobile: { type: Sequelize.STRING(15), allowNull: false },
        purpose: { type: Sequelize.ENUM('SIGNUP', 'LOGIN', 'RESET_PIN', 'VERIFY_EMAIL', 'VERIFY_MOBILE'), allowNull: false },
        otp_hash: { type: Sequelize.STRING(255), allowNull: false },
        attempts: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        expires_at: { type: Sequelize.DATE, allowNull: false },
        consumed_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('otp_verifications', ['country_code', 'mobile', 'purpose', 'created_at'], { name: 'ix_otp_lookup' });
    await queryInterface.addIndex('otp_verifications', ['expires_at'], { name: 'ix_otp_expires' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('otp_verifications');
  },
};
