'use strict';

/**
 * Table: carts (model Cart)
 *
 * Primary key: id
 * References: users, business_accounts, coupons, gift_cards
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'carts',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        guest_token: { type: Sequelize.CHAR(36), allowNull: true },
        business_account_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        coupon_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        gift_card_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        use_wallet: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        pincode: { type: Sequelize.STRING(12), allowNull: true },
        status: { type: Sequelize.ENUM('ACTIVE', 'CONVERTED', 'ABANDONED'), allowNull: false, defaultValue: 'ACTIVE' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('carts', ['user_id', 'status'], { name: 'ix_carts_user' });
    await queryInterface.addIndex('carts', ['guest_token'], { name: 'ix_carts_guest' });
    await queryInterface.addIndex('carts', ['status', 'updated_at'], { name: 'ix_carts_abandoned' });
    await queryInterface.addIndex('carts', ['business_account_id'], { name: 'ix_carts_business_account_id' }); // FK lookup
    await queryInterface.addIndex('carts', ['coupon_id'], { name: 'ix_carts_coupon_id' }); // FK lookup
    await queryInterface.addIndex('carts', ['gift_card_id'], { name: 'ix_carts_gift_card_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('carts', {
      name: 'fk_carts_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('carts', {
      name: 'fk_carts_business_account_id',
      type: 'foreign key',
      fields: ['business_account_id'],
      references: { table: 'business_accounts', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('carts', {
      name: 'fk_carts_coupon_id',
      type: 'foreign key',
      fields: ['coupon_id'],
      references: { table: 'coupons', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('carts', {
      name: 'fk_carts_gift_card_id',
      type: 'foreign key',
      fields: ['gift_card_id'],
      references: { table: 'gift_cards', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('carts');
  },
};
