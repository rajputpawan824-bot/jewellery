'use strict';

/**
 * Table: metal_rates (model MetalRate)
 * Daily metal rate used to compute the metal value in the price break-up.
 * Keyed by (metal, purity) - the same pair as metals.metal / metals.purity - not by FK,
 * because one rate applies to every colour of that purity.
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'metal_rates',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        metal: { type: Sequelize.ENUM('GOLD', 'PLATINUM', 'SILVER'), allowNull: false },
        purity: { type: Sequelize.STRING(10), allowNull: false },
        rate_per_gram: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        currency_code: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'INR' },
        effective_from: { type: Sequelize.DATE, allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('metal_rates', ['metal', 'purity', { name: 'effective_from', order: 'DESC' }], { name: 'ix_metal_rates_latest' });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `metal_rates` ADD CONSTRAINT `ck_metal_rates_rate` CHECK (rate_per_gram > 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('metal_rates');
  },
};
