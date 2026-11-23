'use strict';

// IGI / BIS / GIA certificates
module.exports = (sequelize, DataTypes) => {
  const VariantCertification = sequelize.define(
    'VariantCertification',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      variant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      authority: { type: DataTypes.ENUM('BIS', 'IGI', 'GIA', 'SGL', 'OTHER'), allowNull: false },
      certificate_no: { type: DataTypes.STRING(80), allowNull: true },
      document_url: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'variant_certifications',
      underscored: true,
      timestamps: false,
      indexes: [
        { name: 'ix_vc_variant', fields: ['variant_id'] },
        { name: 'ix_vc_cert_no', fields: ['authority', 'certificate_no'] },
      ],
    }
  );

  VariantCertification.associate = (models) => {
    VariantCertification.belongsTo(models.ProductVariant, { as: 'variant', foreignKey: 'variant_id', onDelete: 'CASCADE' });
  };

  return VariantCertification;
};
