'use strict';

/**
 * Table: product_relations (model ProductRelation)
 * "Similar designs" / matching sets / upsells (Product <-> Product)
 *
 * Primary key: product_id, relation_type, related_product_id
 * References: products
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'product_relations',
      {
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        relation_type: { type: Sequelize.ENUM('SIMILAR', 'MATCHING_SET', 'UPSELL'), allowNull: false, primaryKey: true, defaultValue: 'SIMILAR' },
        related_product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('product_relations', ['related_product_id'], { name: 'ix_pr_related' });

    // Foreign keys
    await queryInterface.addConstraint('product_relations', {
      name: 'fk_product_relations_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('product_relations', {
      name: 'fk_product_relations_related_product_id',
      type: 'foreign key',
      fields: ['related_product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_relations');
  },
};
