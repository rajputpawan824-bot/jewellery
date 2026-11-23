'use strict';

// Database settings in the format sequelize-cli (migrations / seeders) and src/models expect.
// Do not edit values here: they all come from src/config/index.js (and .env).

const { db } = require('./index'); // the one place where database settings live

const connection = {
  username: db.user, // database login user
  password: db.password, // database password
  database: db.name, // database name
  host: db.host, // database server address
  port: db.port, // database server port
  dialect: db.dialect, // database type
};

module.exports = {
  development: { ...connection, logging: console.log, pool: db.pool }, // on a developer machine: print every SQL query
  test: { ...connection, logging: false }, // automated tests: no SQL printing
  production: { ...connection, logging: false, pool: db.pool }, // live server: no SQL printing
};
