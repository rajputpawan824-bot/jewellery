'use strict';

/**
 * Table: product_media (model ProductMedia)
 * Images / videos / 360 / AR models; optionally per variant (image per metal colour)
 *
 * Primary key: id
 * References: products, product_variants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'product_media',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        media_type: { type: Sequelize.ENUM('IMAGE', 'VIDEO', '360', 'AR_MODEL'), allowNull: false, defaultValue: 'IMAGE' },
        url: { type: Sequelize.STRING(500), allowNull: false },
        alt_text: { type: Sequelize.STRING(200), allowNull: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        is_primary: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('product_media', ['product_id', 'sort_order'], { name: 'ix_pm_product' });
    await queryInterface.addIndex('product_media', ['variant_id'], { name: 'ix_pm_variant' });

    // Foreign keys
    await queryInterface.addConstraint('product_media', {
      name: 'fk_product_media_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('product_media', {
      name: 'fk_product_media_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_media');
  },
};
