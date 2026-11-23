'use strict';

/**
 * Table: gift_cards (model GiftCard)
 *
 * Primary key: id
 * References: users
 * Circular FKs (purchase_payment_id) are added in the add-circular-foreign-keys migration.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'gift_cards',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        code: { type: Sequelize.STRING(32), allowNull: false },
        pin_hash: { type: Sequelize.STRING(255), allowNull: true },
        purchaser_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        recipient_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        recipient_name: { type: Sequelize.STRING(150), allowNull: false },
        recipient_mobile: { type: Sequelize.STRING(20), allowNull: false },
        personal_message: { type: Sequelize.STRING(500), allowNull: true },
        initial_amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        balance: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        currency_code: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'INR' },
        delivery_mode: { type: Sequelize.ENUM('INSTANT', 'SCHEDULED'), allowNull: false, defaultValue: 'INSTANT' },
        scheduled_at: { type: Sequelize.DATE, allowNull: true },
        delivered_at: { type: Sequelize.DATE, allowNull: true },
        expires_at: { type: Sequelize.DATE, allowNull: true },
        status: { type: Sequelize.ENUM('PENDING_PAYMENT', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED'), allowNull: false, defaultValue: 'PENDING_PAYMENT' },
        purchase_payment_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('gift_cards', ['code'], { name: 'uq_gift_cards_code', unique: true });
    await queryInterface.addIndex('gift_cards', ['purchaser_user_id', 'created_at'], { name: 'ix_gc_purchaser' });
    await queryInterface.addIndex('gift_cards', ['recipient_user_id', 'status'], { name: 'ix_gc_recipient' });
    await queryInterface.addIndex('gift_cards', ['recipient_mobile'], { name: 'ix_gc_recipient_mobile' });
    await queryInterface.addIndex('gift_cards', ['status', 'delivery_mode', 'scheduled_at'], { name: 'ix_gc_schedule' });
    await queryInterface.addIndex('gift_cards', ['purchase_payment_id'], { name: 'ix_gift_cards_purchase_payment_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('gift_cards', {
      name: 'fk_gift_cards_purchaser_user_id',
      type: 'foreign key',
      fields: ['purchaser_user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('gift_cards', {
      name: 'fk_gift_cards_recipient_user_id',
      type: 'foreign key',
      fields: ['recipient_user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `gift_cards` ADD CONSTRAINT `ck_gc_balance` CHECK (initial_amount >= 500 AND balance >= 0 AND balance <= initial_amount)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('gift_cards');
  },
};
