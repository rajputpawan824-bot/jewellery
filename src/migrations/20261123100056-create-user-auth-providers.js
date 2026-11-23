'use strict';

/**
 * Table: user_auth_providers (model UserAuthProvider)
 * "Or sign in with Google / Apple"
 *
 * Primary key: id
 * References: users
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'user_auth_providers',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        provider: { type: Sequelize.ENUM('GOOGLE', 'APPLE'), allowNull: false },
        provider_user_id: { type: Sequelize.STRING(191), allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('user_auth_providers', ['provider', 'provider_user_id'], { name: 'uq_provider_identity', unique: true });
    await queryInterface.addIndex('user_auth_providers', ['user_id'], { name: 'ix_uap_user' });

    // Foreign keys
    await queryInterface.addConstraint('user_auth_providers', {
      name: 'fk_user_auth_providers_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_auth_providers');
  },
};
