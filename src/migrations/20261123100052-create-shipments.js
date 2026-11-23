'use strict';

/**
 * Table: shipments (model Shipment)
 *
 * Primary key: id
 * References: orders, stores
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'shipments',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        order_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        from_store_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        carrier: { type: Sequelize.STRING(60), allowNull: true },
        tracking_number: { type: Sequelize.STRING(80), allowNull: true },
        tracking_url: { type: Sequelize.STRING(500), allowNull: true },
        is_insured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        insured_value: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        status: { type: Sequelize.ENUM('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO', 'LOST'), allowNull: false, defaultValue: 'CREATED' },
        shipped_at: { type: Sequelize.DATE, allowNull: true },
        delivered_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('shipments', ['order_id'], { name: 'ix_ship_order' });
    await queryInterface.addIndex('shipments', ['carrier', 'tracking_number'], { name: 'ix_ship_tracking' });
    await queryInterface.addIndex('shipments', ['status', 'shipped_at'], { name: 'ix_ship_status' });
    await queryInterface.addIndex('shipments', ['from_store_id'], { name: 'ix_shipments_from_store_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('shipments', {
      name: 'fk_shipments_order_id',
      type: 'foreign key',
      fields: ['order_id'],
      references: { table: 'orders', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('shipments', {
      name: 'fk_shipments_from_store_id',
      type: 'foreign key',
      fields: ['from_store_id'],
      references: { table: 'stores', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shipments');
  },
};
