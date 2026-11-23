'use strict';

/**
 * Table: user_sessions (model UserSession)
 *
 * Primary key: id
 * References: users
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'user_sessions',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        refresh_token_hash: { type: Sequelize.CHAR(64), allowNull: false },
        device_id: { type: Sequelize.STRING(100), allowNull: true },
        device_type: { type: Sequelize.ENUM('ANDROID', 'IOS', 'WEB'), allowNull: true },
        push_token: { type: Sequelize.STRING(255), allowNull: true },
        ip_address: { type: Sequelize.STRING(45), allowNull: true },
        expires_at: { type: Sequelize.DATE, allowNull: false },
        revoked_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('user_sessions', ['refresh_token_hash'], { name: 'uq_session_token', unique: true });
    await queryInterface.addIndex('user_sessions', ['user_id', 'revoked_at'], { name: 'ix_session_user' });

    // Foreign keys
    await queryInterface.addConstraint('user_sessions', {
      name: 'fk_user_sessions_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_sessions');
  },
};
