'use strict';

/**
 * Table: appointments (model Appointment)
 * "Book a Session" - in store, video call or home visit
 *
 * Primary key: id
 * References: users, stores, products
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'appointments',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        full_name: { type: Sequelize.STRING(150), allowNull: false },
        phone: { type: Sequelize.STRING(20), allowNull: false },
        email: { type: Sequelize.STRING(190), allowNull: true },
        interest: { type: Sequelize.ENUM('BRIDAL', 'ENGAGEMENT', 'DAILY_WEAR', 'CUSTOM_DESIGN', 'GIFTING', 'OTHER'), allowNull: false, defaultValue: 'BRIDAL' },
        mode: { type: Sequelize.ENUM('IN_STORE', 'VIDEO_CALL', 'HOME_VISIT'), allowNull: false, defaultValue: 'IN_STORE' },
        store_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        product_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        scheduled_at: { type: Sequelize.DATE, allowNull: true },
        status: { type: Sequelize.ENUM('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'), allowNull: false, defaultValue: 'REQUESTED' },
        notes: { type: Sequelize.STRING(500), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('appointments', ['user_id', 'scheduled_at'], { name: 'ix_appt_user' });
    await queryInterface.addIndex('appointments', ['store_id', 'scheduled_at'], { name: 'ix_appt_store_slot' });
    await queryInterface.addIndex('appointments', ['status', 'created_at'], { name: 'ix_appt_status' });
    await queryInterface.addIndex('appointments', ['phone'], { name: 'ix_appt_phone' });
    await queryInterface.addIndex('appointments', ['product_id'], { name: 'ix_appointments_product_id' }); // FK lookup

    // Foreign keys
    await queryInterface.addConstraint('appointments', {
      name: 'fk_appointments_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: { table: 'users', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('appointments', {
      name: 'fk_appointments_store_id',
      type: 'foreign key',
      fields: ['store_id'],
      references: { table: 'stores', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('appointments', {
      name: 'fk_appointments_product_id',
      type: 'foreign key',
      fields: ['product_id'],
      references: { table: 'products', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('appointments');
  },
};
