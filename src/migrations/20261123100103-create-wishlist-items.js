'use strict';

/**
 * Table: wishlist_items (model WishlistItem)
 * Wishlist (User <-> Product, optionally remembering the chosen variant)
 *
 * Primary key: user_id, product_id
 * References: users, products, product_variants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'wishlist_items',
      {
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('wishlist_items', ['user_id', 'created_at'], { name: 'ix_wish_user_time' });
    await queryInterface.addIndex('wishlist_items', ['product_id'], { name: 'ix_wish_product' });
    await queryInterface.addIndex('wishlist_items', ['variant_id'], { name: 'ix_wishlist_items_variant_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('wishlist_items', {
      name: 'fk_wishlist_items_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('wishlist_items', {
      name: 'fk_wishlist_items_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('wishlist_items', {
      name: 'fk_wishlist_items_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wishlist_items');
  },
};
