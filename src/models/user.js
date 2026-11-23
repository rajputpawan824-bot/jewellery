'use strict';

// Customer account (Create Account, Sign In, OTP, PIN, Personal Info).
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      full_name: { type: DataTypes.STRING(150), allowNull: false },
      country_code: { type: DataTypes.STRING(5), allowNull: false, defaultValue: '+91' },
      mobile: { type: DataTypes.STRING(15), allowNull: false },
      mobile_verified_at: { type: DataTypes.DATE, allowNull: true },
      email: { type: DataTypes.STRING(190), allowNull: true, validate: { isEmail: true } },
      email_verified_at: { type: DataTypes.DATE, allowNull: true },
      // 4 digit login MPIN, bcrypt hash only
      mpin_hash: { type: DataTypes.STRING(255), allowNull: true },
      date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      gender: { type: DataTypes.ENUM('FEMALE', 'MALE', 'PREFER_NOT_TO_SAY'), allowNull: true },
      avatar_url: { type: DataTypes.STRING(500), allowNull: true },
      customer_type: { type: DataTypes.ENUM('B2C', 'B2B'), allowNull: false, defaultValue: 'B2C' },
      // override; NULL = default RETAIL list
      price_list_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      status: { type: DataTypes.ENUM('ACTIVE', 'BLOCKED', 'DELETED'), allowNull: false, defaultValue: 'ACTIVE' },
      // "I agree to the Terms & Conditions and Privacy Policy" checkbox
      is_terms_accepted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      terms_accepted_at: { type: DataTypes.DATE, allowNull: true },
      last_login_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
      paranoid: true,
      // never return the MPIN hash unless asked for explicitly: User.scope('withMpin')
      defaultScope: { attributes: { exclude: ['mpin_hash'] } },
      scopes: { withMpin: { attributes: { include: ['mpin_hash'] } } },
      indexes: [
        { name: 'uq_users_mobile', unique: true, fields: ['country_code', 'mobile'] },
        { name: 'uq_users_email', unique: true, fields: ['email'] },
        { name: 'ix_users_type_status', fields: ['customer_type', 'status'] },
        { name: 'ix_users_created', fields: ['created_at'] },
      ],
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.PriceList, { as: 'priceList', foreignKey: 'price_list_id', onDelete: 'RESTRICT' });

    // B2B
    User.hasMany(models.BusinessAccountUser, { as: 'businessMemberships', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.belongsToMany(models.BusinessAccount, {
      as: 'businessAccounts',
      through: models.BusinessAccountUser,
      foreignKey: 'user_id',
      otherKey: 'business_account_id',
    });

    // auth & profile
    User.hasMany(models.UserAuthProvider, { as: 'authProviders', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasMany(models.UserSession, { as: 'sessions', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasMany(models.Address, { as: 'addresses', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasMany(models.UserNotificationPreference, { as: 'notificationPreferences', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasMany(models.UserPaymentMethod, { as: 'paymentMethods', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasMany(models.UserBankAccount, { as: 'bankAccounts', foreignKey: 'user_id', onDelete: 'CASCADE' });

    // engagement
    User.hasMany(models.WishlistItem, { as: 'wishlistItems', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.belongsToMany(models.Product, {
      as: 'wishlistProducts',
      through: models.WishlistItem,
      foreignKey: 'user_id',
      otherKey: 'product_id',
    });
    User.hasMany(models.RecentlyViewed, { as: 'recentlyViewed', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.belongsToMany(models.Product, {
      as: 'recentlyViewedProducts',
      through: models.RecentlyViewed,
      foreignKey: 'user_id',
      otherKey: 'product_id',
    });
    User.hasMany(models.CompareItem, { as: 'compareItems', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.belongsToMany(models.ProductVariant, {
      as: 'compareVariants',
      through: models.CompareItem,
      foreignKey: 'user_id',
      otherKey: 'variant_id',
    });
    User.hasMany(models.Review, { as: 'reviews', foreignKey: 'user_id', onDelete: 'RESTRICT' });

    // money
    User.hasMany(models.GiftCard, { as: 'purchasedGiftCards', foreignKey: 'purchaser_user_id', onDelete: 'RESTRICT' });
    User.hasMany(models.GiftCard, { as: 'receivedGiftCards', foreignKey: 'recipient_user_id', onDelete: 'RESTRICT' });
    User.hasOne(models.Wallet, { as: 'wallet', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    User.hasMany(models.PlanEnrollment, { as: 'planEnrollments', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    User.hasMany(models.CouponRedemption, { as: 'couponRedemptions', foreignKey: 'user_id', onDelete: 'RESTRICT' });

    // shopping
    User.hasMany(models.Cart, { as: 'carts', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasMany(models.Order, { as: 'orders', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    User.hasMany(models.Payment, { as: 'payments', foreignKey: 'user_id', onDelete: 'RESTRICT' });
    User.hasMany(models.AfterSaleRequest, { as: 'afterSaleRequests', foreignKey: 'user_id', onDelete: 'RESTRICT' });

    // services
    User.hasMany(models.Appointment, { as: 'appointments', foreignKey: 'user_id', onDelete: 'SET NULL' });
    User.hasMany(models.Notification, { as: 'notifications', foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasMany(models.SupportTicket, { as: 'supportTickets', foreignKey: 'user_id', onDelete: 'SET NULL' });
  };

  return User;
};
