'use strict';

// "RECENT" tab in the bottom nav (User <-> Product)
module.exports = (sequelize, DataTypes) => {
  const RecentlyViewed = sequelize.define(
    'RecentlyViewed',
    {
      user_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      viewed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      view_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    },
    {
      tableName: 'recently_viewed',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'ix_rv_user_time', fields: ['user_id', 'viewed_at'] }],
    }
  );

  RecentlyViewed.associate = (models) => {
    RecentlyViewed.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'CASCADE' });
    RecentlyViewed.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
  };

  return RecentlyViewed;
};
