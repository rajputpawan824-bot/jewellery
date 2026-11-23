'use strict';

/**
 * Table: job_openings (model JobOpening)
 * Career page: OPEN ROLES
 *
 * Primary key: id
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'job_openings',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        title: { type: Sequelize.STRING(150), allowNull: false },
        department: { type: Sequelize.ENUM('DESIGN', 'MARKETING', 'RETAIL', 'OPERATIONS', 'TECHNOLOGY', 'OTHER'), allowNull: false },
        location: { type: Sequelize.STRING(100), allowNull: true },
        employment_type: { type: Sequelize.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'), allowNull: false, defaultValue: 'FULL_TIME' },
        description: { type: Sequelize.TEXT, allowNull: true },
        is_open: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        posted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('job_openings', ['is_open', 'department'], { name: 'ix_jobs_open' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_openings');
  },
};
