'use strict';

/**
 * Table: variant_certifications (model VariantCertification)
 * IGI / BIS / GIA certificates
 *
 * Primary key: id
 * References: product_variants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'variant_certifications',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        variant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        authority: { type: Sequelize.ENUM('BIS', 'IGI', 'GIA', 'SGL', 'OTHER'), allowNull: false },
        certificate_no: { type: Sequelize.STRING(80), allowNull: true },
        document_url: { type: Sequelize.STRING(500), allowNull: true },
      },
      { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    // Indexes
    await queryInterface.addIndex('variant_certifications', ['variant_id'], { name: 'ix_vc_variant' });
    await queryInterface.addIndex('variant_certifications', ['authority', 'certificate_no'], { name: 'ix_vc_cert_no' });

    // Foreign keys
    await queryInterface.addConstraint('variant_certifications', {
      name: 'fk_variant_certifications_variant_id',
      type: 'foreign key',
      fields: ['variant_id'],
      references: { table: 'product_variants', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('variant_certifications');
  },
};
