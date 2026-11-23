'use strict';

/**
 * Table: product_collections (model ProductCollection)
 * Product <-> Collection (many-to-many)
 *
 * Primary key: product_id, collection_id
 * References: products, collections
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'product_collections',
      {
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        collection_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('product_collections', ['collection_id', 'sort_order'], { name: 'ix_pc_collection' });

    // Foreign keys
    await queryInterface.addConstraint('product_collections', {
      name: 'fk_product_collections_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('product_collections', {
      name: 'fk_product_collections_collection_id',
      type: 'foreign key',
      fields: ['collection_id'],
      references: { table: 'collections', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_collections');
  },
};
