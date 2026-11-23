'use strict';

/**
 * Table: product_customization_options (model ProductCustomizationOption)
 * Customization popup: which options a product allows (metal colour, purity, engraving ...)
 *
 * Primary key: id
 * References: products
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'product_customization_options',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        option_key: { type: Sequelize.STRING(40), allowNull: false },
        option_label: { type: Sequelize.STRING(80), allowNull: false },
        allowed_values: { type: Sequelize.JSON, allowNull: true },
        extra_charge: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        is_required: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('product_customization_options', ['product_id', 'option_key'], { name: 'uq_pco', unique: true });

    // Foreign keys
    await queryInterface.addConstraint('product_customization_options', {
      name: 'fk_product_customization_options_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_customization_options');
  },
};
