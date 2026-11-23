'use strict';

/**
 * Table: notifications (model Notification)
 * Notification screen. reference_type + reference_id is a polymorphic pointer, no FK.
 *
 * Primary key: id
 * References: users
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'notifications',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        category: { type: Sequelize.ENUM('ORDERS', 'OFFERS', 'PLAN', 'WALLET', 'APPOINTMENTS', 'GENERAL'), allowNull: false },
        title: { type: Sequelize.STRING(150), allowNull: false },
        body: { type: Sequelize.STRING(500), allowNull: false },
        image_url: { type: Sequelize.STRING(500), allowNull: true },
        deep_link: { type: Sequelize.STRING(300), allowNull: true },
        reference_type: { type: Sequelize.STRING(30), allowNull: true },
        reference_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        read_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('notifications', ['user_id', 'created_at'], { name: 'ix_notif_user_time' });
    await queryInterface.addIndex('notifications', ['user_id', 'is_read', 'created_at'], { name: 'ix_notif_user_unread' });

    // Foreign keys
    await queryInterface.addConstraint('notifications', {
      name: 'fk_notifications_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  },
};
