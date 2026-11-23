'use strict';

/**
 * Table: variant_stones (model VariantStone)
 * Stones in a variant: "9 SI IJ Diamonds", "VVS1 Clarity, E Color", "Blue Evil Eye"
 *
 * Primary key: id
 * References: product_variants, stone_types
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'variant_stones',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        stone_type_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false },
        shape: { type: Sequelize.STRING(40), allowNull: true },
        clarity: { type: Sequelize.STRING(20), allowNull: true },
        color_grade: { type: Sequelize.STRING(20), allowNull: true },
        setting: { type: Sequelize.STRING(40), allowNull: true },
        stone_count: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
        total_carat: { type: Sequelize.DECIMAL(9, 3), allowNull: true },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('variant_stones', ['variant_id'], { name: 'ix_vs_variant' });
    await queryInterface.addIndex('variant_stones', ['stone_type_id', 'variant_id'], { name: 'ix_vs_stone_filter' });

    // Foreign keys
    await queryInterface.addConstraint('variant_stones', {
      name: 'fk_variant_stones_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('variant_stones', {
      name: 'fk_variant_stones_stone_type_id',
      type: 'foreign key',
      fields: ['stone_type_id'],
      references: { table: 'stone_types', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('variant_stones');
  },
};
