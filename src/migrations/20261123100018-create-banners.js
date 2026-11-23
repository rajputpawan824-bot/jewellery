'use strict';

/**
 * Table: banners (model Banner)
 * Home page hero / "LIMITED TIME OFFER" / "Gifts for Every Chapter" blocks
 *
 * Primary key: id
 * References: coupons
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'banners',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        placement: { type: Sequelize.ENUM('HOME_HERO', 'HOME_OFFER', 'HOME_OCCASION', 'LISTING_TOP', 'PRODUCT_LABEL'), allowNull: false },
        title: { type: Sequelize.STRING(150), allowNull: true },
        subtitle: { type: Sequelize.STRING(255), allowNull: true },
        image_url: { type: Sequelize.STRING(500), allowNull: true },
        cta_text: { type: Sequelize.STRING(40), allowNull: true },
        deep_link: { type: Sequelize.STRING(300), allowNull: true },
        coupon_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        customer_type: { type: Sequelize.ENUM('ALL', 'B2C', 'B2B'), allowNull: false, defaultValue: 'ALL' },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        starts_at: { type: Sequelize.DATE, allowNull: true },
        ends_at: { type: Sequelize.DATE, allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('banners', ['placement', 'is_active', 'customer_type', 'sort_order'], { name: 'ix_banners_live' });
    await queryInterface.addIndex('banners', ['coupon_id'], { name: 'ix_banners_coupon_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('banners', {
      name: 'fk_banners_coupon_id',
      type: 'foreign key',
      fields: ['coupon_id'],
      references: { table: 'coupons', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('banners');
  },
};
