'use strict';

/**
 * Table: recently_viewed (model RecentlyViewed)
 * "RECENT" tab in the bottom nav (User <-> Product)
 *
 * Primary key: user_id, product_id
 * References: users, products
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'recently_viewed',
      {
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
        viewed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        view_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('recently_viewed', ['user_id', 'viewed_at'], { name: 'ix_rv_user_time' });
    await queryInterface.addIndex('recently_viewed', ['product_id'], { name: 'ix_recently_viewed_product_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('recently_viewed', {
      name: 'fk_recently_viewed_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('recently_viewed', {
      name: 'fk_recently_viewed_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('recently_viewed');
  },
};
