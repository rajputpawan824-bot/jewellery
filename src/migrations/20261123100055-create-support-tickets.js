'use strict';

/**
 * Table: support_tickets (model SupportTicket)
 * Help & Support / "Contact Customer Care" / Jewelry Concierge chat
 *
 * Primary key: id
 * References: users, orders
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'support_tickets',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        channel: { type: Sequelize.ENUM('CHAT', 'CALL', 'EMAIL', 'APP'), allowNull: false, defaultValue: 'APP' },
        subject: { type: Sequelize.STRING(200), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        status: { type: Sequelize.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'), allowNull: false, defaultValue: 'OPEN' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('support_tickets', ['user_id', 'created_at'], { name: 'ix_st_user' });
    await queryInterface.addIndex('support_tickets', ['status', 'created_at'], { name: 'ix_st_status' });
    await queryInterface.addIndex('support_tickets', ['order_id'], { name: 'ix_st_order' });

    // Foreign keys
    await queryInterface.addConstraint('support_tickets', {
      name: 'fk_support_tickets_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('support_tickets', {
      name: 'fk_support_tickets_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('support_tickets');
  },
};
