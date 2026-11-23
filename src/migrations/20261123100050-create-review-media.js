'use strict';

/**
 * Table: review_media (model ReviewMedia)
 *
 * Primary key: id
 * References: reviews
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'review_media',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        review_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        url: { type: Sequelize.STRING(500), allowNull: false },
        media_type: { type: Sequelize.ENUM('IMAGE', 'VIDEO'), allowNull: false, defaultValue: 'IMAGE' },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('review_media', ['review_id'], { name: 'ix_rm_review' });

    // Foreign keys
    await queryInterface.addConstraint('review_media', {
      name: 'fk_review_media_review_id',
      type: 'foreign key',
      fields: ['review_id'],
      references: { table: 'reviews', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('review_media');
  },
};
