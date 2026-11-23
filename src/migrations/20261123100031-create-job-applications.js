'use strict';

/**
 * Table: job_applications (model JobApplication)
 * "Apply Now": full name, position, place, resume
 *
 * Primary key: id
 * References: job_openings
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'job_applications',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        job_opening_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        position_text: { type: Sequelize.STRING(150), allowNull: false },
        full_name: { type: Sequelize.STRING(150), allowNull: false },
        email: { type: Sequelize.STRING(190), allowNull: true },
        phone: { type: Sequelize.STRING(20), allowNull: true },
        preferred_place: { type: Sequelize.STRING(100), allowNull: true },
        resume_url: { type: Sequelize.STRING(500), allowNull: false },
        status: { type: Sequelize.ENUM('NEW', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'), allowNull: false, defaultValue: 'NEW' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('job_applications', ['job_opening_id', 'status'], { name: 'ix_ja_job' });
    await queryInterface.addIndex('job_applications', ['status', 'created_at'], { name: 'ix_ja_status' });

    // Foreign keys
    await queryInterface.addConstraint('job_applications', {
      name: 'fk_job_applications_job_opening_id',
      type: 'foreign key',
      fields: ['job_opening_id'],
      references: { table: 'job_openings', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_applications');
  },
};
