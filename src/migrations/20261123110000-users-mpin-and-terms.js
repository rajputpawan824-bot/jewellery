'use strict';

/**
 * users:
 *  - pin_hash renamed to mpin_hash (the 4 digit login MPIN)
 *  - is_terms_accepted added: the "I agree to the Terms & Conditions and Privacy Policy"
 *    checkbox on Create Account. terms_accepted_at keeps the time it was accepted.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `users` CHANGE COLUMN `pin_hash` `mpin_hash` VARCHAR(255) NULL'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE `users` ADD COLUMN `is_terms_accepted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`'
    );
    // Rows that already have an acceptance time have accepted the terms.
    await queryInterface.sequelize.query(
      'UPDATE `users` SET `is_terms_accepted` = 1 WHERE `terms_accepted_at` IS NOT NULL'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE `users` DROP COLUMN `is_terms_accepted`');
    await queryInterface.sequelize.query(
      'ALTER TABLE `users` CHANGE COLUMN `mpin_hash` `pin_hash` VARCHAR(255) NULL'
    );
  },
};
