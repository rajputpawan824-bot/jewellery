'use strict';

/**
 * Table: shipment_items (model ShipmentItem)
 * Which order lines (and how many) went in a shipment (Shipment <-> OrderItem)
 *
 * Primary key: shipment_id, order_item_id
 * References: shipments, order_items
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'shipment_items',
      {
        shipment_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        order_item_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        quantity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('shipment_items', ['order_item_id'], { name: 'ix_si_order_item' });

    // Foreign keys
    await queryInterface.addConstraint('shipment_items', {
      name: 'fk_shipment_items_shipment_id',
      type: 'foreign key',
      fields: ['shipment_id'],
      references: { table: 'shipments', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('shipment_items', {
      name: 'fk_shipment_items_order_item_id',
      type: 'foreign key',
      fields: ['order_item_id'],
      references: { table: 'order_items', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shipment_items');
  },
};
