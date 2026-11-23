'use strict';

module.exports = (sequelize, DataTypes) => {
  const ReviewMedia = sequelize.define(
    'ReviewMedia',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      review_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      url: { type: DataTypes.STRING(500), allowNull: false },
      media_type: { type: DataTypes.ENUM('IMAGE', 'VIDEO'), allowNull: false, defaultValue: 'IMAGE' },
    },
    {
      tableName: 'review_media',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_rm_review', fields: ['review_id'] }],
    }
  );

  ReviewMedia.associate = (models) => {
    ReviewMedia.belongsTo(models.Review, { as: 'review', foreignKey: 'review_id', onDelete: 'CASCADE' });
  };

  return ReviewMedia;
};
