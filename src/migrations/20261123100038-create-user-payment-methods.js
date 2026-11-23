'use strict';

/**
 * Table: user_payment_methods (model UserPaymentMethod)
 * Saved cards / UPI (gateway tokens only, never PAN/CVV) - "Visa ending 4242"
 *
 * Primary key: id
 * References: users
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'user_payment_methods',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        method_type: { type: Sequelize.ENUM('CARD', 'UPI'), allowNull: false, defaultValue: 'CARD' },
        gateway: { type: Sequelize.STRING(40), allowNull: false },
        gateway_token: { type: Sequelize.STRING(255), allowNull: false },
        card_brand: { type: Sequelize.STRING(20), allowNull: true },
        card_last4: { type: Sequelize.CHAR(4), allowNull: true },
        card_holder: { type: Sequelize.STRING(150), allowNull: true },
        expiry_month: { type: Sequelize.TINYINT.UNSIGNED, allowNull: true },
        expiry_year: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
        upi_vpa: { type: Sequelize.STRING(100), allowNull: true },
        is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('user_payment_methods', ['gateway', 'gateway_token'], { name: 'uq_upm_token', unique: true });
    await queryInterface.addIndex('user_payment_methods', ['user_id', 'is_default'], { name: 'ix_upm_user' });

    // Foreign keys
    await queryInterface.addConstraint('user_payment_methods', {
      name: 'fk_user_payment_methods_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Business-rule CHECK constraints
    await queryInterface.sequelize.query(
      'ALTER TABLE `user_payment_methods` ADD CONSTRAINT `ck_upm_expiry` CHECK (expiry_month IS NULL OR expiry_month BETWEEN 1 AND 12)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_payment_methods');
  },
};
