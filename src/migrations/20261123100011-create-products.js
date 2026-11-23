'use strict';

/**
 * Table: products (model Product)
 * Product (design). The sellable unit is ProductVariant.
 *
 * Primary key: id
 * References: categories
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'products',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        product_code: { type: Sequelize.STRING(40), allowNull: false },
        name: { type: Sequelize.STRING(200), allowNull: false },
        slug: { type: Sequelize.STRING(220), allowNull: false },
        short_description: { type: Sequelize.STRING(500), allowNull: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        category_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        gender: { type: Sequelize.ENUM('WOMEN', 'MEN', 'UNISEX', 'KIDS'), allowNull: false, defaultValue: 'WOMEN' },
        is_customizable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_plan_eligible: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        has_virtual_tryon: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_returnable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        return_window_days: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 30 },
        lifetime_buyback: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        lifetime_exchange: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        is_bis_hallmarked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        min_price: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        max_price: { type: Sequelize.DECIMAL(14, 2), allowNull: true },
        avg_rating: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
        review_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        popularity_score: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        is_trending: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        is_exclusive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        status: { type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED'), allowNull: false, defaultValue: 'DRAFT' },
        meta_title: { type: Sequelize.STRING(200), allowNull: true },
        meta_description: { type: Sequelize.STRING(400), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('products', ['product_code'], { name: 'uq_products_code', unique: true });
    await queryInterface.addIndex('products', ['slug'], { name: 'uq_products_slug', unique: true });
    await queryInterface.addIndex('products', ['category_id', 'status', 'min_price'], { name: 'ix_products_cat_price' });
    await queryInterface.addIndex('products', ['category_id', 'status', 'created_at'], { name: 'ix_products_cat_new' });
    await queryInterface.addIndex('products', ['category_id', 'status', 'popularity_score'], { name: 'ix_products_cat_pop' });
    await queryInterface.addIndex('products', ['status', 'gender', 'min_price'], { name: 'ix_products_gender' });
    await queryInterface.addIndex('products', ['status', 'is_trending', 'popularity_score'], { name: 'ix_products_trending' });
    await queryInterface.addIndex('products', ['name', 'short_description', 'description'], { name: 'ft_products_search', type: 'FULLTEXT' });

    // Foreign keys
    await queryInterface.addConstraint('products', {
      name: 'fk_products_category_id',
      type: 'foreign key',
      fields: ['category_id'],
      references: { table: 'categories', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `products` ADD CONSTRAINT `ck_products_rating` CHECK (avg_rating BETWEEN 0 AND 5)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
