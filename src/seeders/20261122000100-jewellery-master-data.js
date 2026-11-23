'use strict';

// Minimum rows the app expects (also included at the end of database/jewellery_schema.sql).

const PRICE_LISTS = [{ code: 'RETAIL', name: 'Retail (B2C)', customer_type: 'B2C', is_default: 1 }];

const METALS = [
  { metal: 'GOLD', purity: '14KT', color: 'YELLOW', fineness: 0.585 },
  { metal: 'GOLD', purity: '14KT', color: 'WHITE', fineness: 0.585 },
  { metal: 'GOLD', purity: '14KT', color: 'ROSE', fineness: 0.585 },
  { metal: 'GOLD', purity: '18KT', color: 'YELLOW', fineness: 0.75 },
  { metal: 'GOLD', purity: '18KT', color: 'WHITE', fineness: 0.75 },
  { metal: 'GOLD', purity: '18KT', color: 'ROSE', fineness: 0.75 },
  { metal: 'GOLD', purity: '22KT', color: 'YELLOW', fineness: 0.916 },
  { metal: 'PLATINUM', purity: '950', color: 'WHITE', fineness: 0.95 },
];

const CATEGORIES = [
  { name: 'Rings', slug: 'rings', sort_order: 1 },
  { name: 'Earrings', slug: 'earrings', sort_order: 2 },
  { name: 'Necklaces', slug: 'necklaces', sort_order: 3 },
  { name: 'Mangalsutra', slug: 'mangalsutra', sort_order: 4 },
  { name: 'Pendants', slug: 'pendants', sort_order: 5 },
  { name: 'Amulets', slug: 'amulets', sort_order: 6 },
];

const OCCASIONS = [
  { name: 'Anniversary', slug: 'anniversary', sort_order: 1 },
  { name: 'Engagement', slug: 'engagement', sort_order: 2 },
  { name: 'Weddings', slug: 'weddings', sort_order: 3 },
  { name: 'Festivals', slug: 'festivals', sort_order: 4 },
  { name: 'For Mothers', slug: 'for-mothers', sort_order: 5 },
  { name: 'Gifts', slug: 'gifts', sort_order: 6 },
];

const SAVINGS_PLANS = [
  { code: 'GOLD_MINE_10_1', name: 'Gold Mine 10 + 1 Monthly Plan', installments_count: 10, bonus_installments: 1.0, min_monthly_amount: 1000 },
];

const COUPON_PCTS = [10, 15, 20, 30];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.sequelize.transaction(async (transaction) => {
      const opts = { transaction };
      await queryInterface.bulkInsert('price_lists', PRICE_LISTS.map((r) => ({ ...r, created_at: now, updated_at: now })), opts);
      await queryInterface.bulkInsert('metals', METALS, opts);
      await queryInterface.bulkInsert('categories', CATEGORIES.map((r) => ({ ...r, created_at: now })), opts);
      await queryInterface.bulkInsert('occasions', OCCASIONS, opts);
      await queryInterface.bulkInsert('savings_plans', SAVINGS_PLANS, opts);
      await queryInterface.bulkInsert(
        'coupons',
        COUPON_PCTS.map((pct) => ({
          code: `SUMMER${pct}`,
          title: `${pct}% off on Making Charges`,
          discount_type: 'PERCENT',
          discount_value: pct,
          applies_on: 'MAKING_CHARGES',
          starts_at: now,
          created_at: now,
        })),
        opts
      );
    });
  },

  async down(queryInterface) {
    const { Op } = queryInterface.sequelize.Sequelize;
    await queryInterface.sequelize.transaction(async (transaction) => {
      const opts = { transaction };
      await queryInterface.bulkDelete('coupons', { code: { [Op.in]: COUPON_PCTS.map((p) => `SUMMER${p}`) } }, opts);
      await queryInterface.bulkDelete('savings_plans', { code: { [Op.in]: SAVINGS_PLANS.map((r) => r.code) } }, opts);
      await queryInterface.bulkDelete('occasions', { slug: { [Op.in]: OCCASIONS.map((r) => r.slug) } }, opts);
      await queryInterface.bulkDelete('categories', { slug: { [Op.in]: CATEGORIES.map((r) => r.slug) } }, opts);
      await queryInterface.bulkDelete('metals', { [Op.or]: METALS.map(({ metal, purity, color }) => ({ metal, purity, color })) }, opts);
      await queryInterface.bulkDelete('price_lists', { code: { [Op.in]: PRICE_LISTS.map((r) => r.code) } }, opts);
    });
  },
};
