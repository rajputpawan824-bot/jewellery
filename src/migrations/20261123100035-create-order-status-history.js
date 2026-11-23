'use strict';

/**
 * Table: order_status_history (model OrderStatusHistory)
 * Placed -> Shipped -> In Transit -> Delivered timeline.
 * changed_by is the id of whoever made the change (customer, admin or system job); no FK by design.
 *
 * Primary key: id
 * References: orders
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'order_status_history',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        from_status: { type: Sequelize.STRING(30), allowNull: true },
        to_status: { type: Sequelize.STRING(30), allowNull: false },
        note: { type: Sequelize.STRING(255), allowNull: true },
        changed_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('order_status_history', ['order_id', 'created_at'], { name: 'ix_osh_order' });

    // Foreign keys
    await queryInterface.addConstraint('order_status_history', {
      name: 'fk_order_status_history_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_status_history');
  },
};
