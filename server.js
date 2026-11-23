'use strict';

require('module-alias/register');

const config = require('@config');
const app = require('./app');
const db = require('@models');

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`SEOKart server running on port ${config.port}`);
  });
}

start();
