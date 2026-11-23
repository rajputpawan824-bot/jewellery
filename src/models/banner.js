'use strict';

// Home page hero / "LIMITED TIME OFFER" / "Gifts for Every Chapter" blocks
module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    'Banner',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      placement: {
        type: DataTypes.ENUM('HOME_HERO', 'HOME_OFFER', 'HOME_OCCASION', 'LISTING_TOP', 'PRODUCT_LABEL'),
        allowNull: false,
      },
      title: { type: DataTypes.STRING(150), allowNull: true },
      subtitle: { type: DataTypes.STRING(255), allowNull: true },
      image_url: { type: DataTypes.STRING(500), allowNull: true },
      cta_text: { type: DataTypes.STRING(40), allowNull: true },
      deep_link: { type: DataTypes.STRING(300), allowNull: true },
      coupon_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      customer_type: { type: DataTypes.ENUM('ALL', 'B2C', 'B2B'), allowNull: false, defaultValue: 'ALL' },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      starts_at: { type: DataTypes.DATE, allowNull: true },
      ends_at: { type: DataTypes.DATE, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'banners',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_banners_live', fields: ['placement', 'is_active', 'customer_type', 'sort_order'] }],
    }
  );

  Banner.associate = (models) => {
    Banner.belongsTo(models.Coupon, { as: 'coupon', foreignKey: 'coupon_id', onDelete: 'SET NULL' });
  };

  return Banner;
};
