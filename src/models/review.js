'use strict';

// Review page: "4.9 based on 2,452 reviews", city, Verified Buyer
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      order_item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }, // set => verified buyer
      rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, validate: { min: 1, max: 5 } },
      title: { type: DataTypes.STRING(150), allowNull: true },
      body: { type: DataTypes.TEXT, allowNull: true },
      reviewer_city: { type: DataTypes.STRING(100), allowNull: true },
      is_verified_buyer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      helpful_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      is_featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // "What Our Customers Say"
      status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
    },
    {
      tableName: 'reviews',
      underscored: true,
      timestamps: true,
      indexes: [
        { name: 'uq_review_order_item', unique: true, fields: ['order_item_id'] },
        { name: 'ix_reviews_product', fields: ['product_id', 'status', 'created_at'] },
        { name: 'ix_reviews_product_rating', fields: ['product_id', 'status', 'rating'] },
        { name: 'ix_reviews_featured', fields: ['status', 'is_featured', 'created_at'] },
        { name: 'ix_reviews_user', fields: ['user_id'] },
      ],
    }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.Product, { as: 'product', foreignKey: 'product_id', onDelete: 'CASCADE' });
    Review.belongsTo(models.User, { as: 'user', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    Review.belongsTo(models.OrderItem, { as: 'orderItem', foreignKey: 'order_item_id', onDelete: 'SET NULL' });
    Review.hasMany(models.ReviewMedia, { as: 'media', foreignKey: 'review_id', onDelete: 'CASCADE' });
  };

  return Review;
};
