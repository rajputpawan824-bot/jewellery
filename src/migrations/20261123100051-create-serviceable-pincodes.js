'use strict';

/**
 * Table: serviceable_pincodes (model ServiceablePincode)
 * "Select PIN CODE" -> "Expected delivery date", COD availability.
 * Lookup table: addresses / carts store the pincode as text, so there is no FK.
 *
 * Primary key: pincode
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'serviceable_pincodes',
      {
        pincode: { type: Sequelize.STRING(12), allowNull: false, primaryKey: true },
        city: { type: Sequelize.STRING(100), allowNull: true },
        state: { type: Sequelize.STRING(100), allowNull: true },
        delivery_days: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 5 },
        cod_available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('serviceable_pincodes');
  },
};
