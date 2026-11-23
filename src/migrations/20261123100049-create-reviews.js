'use strict';

/**
 * Table: reviews (model Review)
 * Review page: "4.9 based on 2,452 reviews", city, Verified Buyer
 *
 * Primary key: id
 * References: products, users, order_items
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'reviews',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        order_item_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        rating: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
        title: { type: Sequelize.STRING(150), allowNull: true },
        body: { type: Sequelize.TEXT, allowNull: true },
        reviewer_city: { type: Sequelize.STRING(100), allowNull: true },
        is_verified_buyer: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        helpful_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        is_featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('reviews', ['order_item_id'], { name: 'uq_review_order_item', unique: true });
    await queryInterface.addIndex('reviews', ['product_id', 'status', 'created_at'], { name: 'ix_reviews_product' });
    await queryInterface.addIndex('reviews', ['product_id', 'status', 'rating'], { name: 'ix_reviews_product_rating' });
    await queryInterface.addIndex('reviews', ['status', 'is_featured', 'created_at'], { name: 'ix_reviews_featured' });
    await queryInterface.addIndex('reviews', ['user_id'], { name: 'ix_reviews_user' });

    // Foreign keys
    await queryInterface.addConstraint('reviews', {
      name: 'fk_reviews_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('reviews', {
      name: 'fk_reviews_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('reviews', {
      name: 'fk_reviews_order_item_id',
      type: 'foreign key',
      fields: ['order_item_id'],
      references: { table: 'order_items', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `reviews` ADD CONSTRAINT `ck_reviews_rating` CHECK (rating BETWEEN 1 AND 5)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
  },
};
