'use strict';

/**
 * Table: user_notification_preferences (model UserNotificationPreference)
 * Notification Preferences + "Communication Preference: Email, SMS, Push"
 *
 * Primary key: user_id, channel, category
 * References: users
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'user_notification_preferences',
      {
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        channel: { type: Sequelize.ENUM('EMAIL', 'SMS', 'PUSH', 'WHATSAPP'), allowNull: false, primaryKey: true },
        category: { type: Sequelize.ENUM('ORDERS', 'OFFERS', 'PLAN', 'WALLET', 'APPOINTMENTS', 'GENERAL'), allowNull: false, primaryKey: true },
        is_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Foreign keys
    await queryInterface.addConstraint('user_notification_preferences', {
      name: 'fk_user_notification_preferences_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_notification_preferences');
  },
};
