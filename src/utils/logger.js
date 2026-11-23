'use strict';

const fs = require('fs');
const path = require('path');

const LOG_ROOT = path.join(process.cwd(), 'logs');
const LOG_TYPES = ['success', 'error'];

/**
 * Today's folder name in DD-MM-YYYY (e.g. 23-10-2026).
 */
const getDateFolder = (date = new Date()) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Ensures logs/<date>/{success,error} exist.
 */
const ensureLogDirs = (dateFolder = getDateFolder()) => {
  for (const type of LOG_TYPES) {
    const dir = path.join(LOG_ROOT, dateFolder, type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  return dateFolder;
};

/**
 * Append a JSON line to logs/<date>/<type>/<type>.log
 * Non-blocking — failures are swallowed so responses never break.
 */
const writeLog = (type, payload = {}) => {
  if (!LOG_TYPES.includes(type)) {
    type = 'error';
  }

  try {
    const dateFolder = ensureLogDirs();
    const filePath = path.join(LOG_ROOT, dateFolder, type, `${type}.log`);
    const entry = {
      timestamp: new Date().toISOString(),
      ...payload,
    };
    fs.appendFile(filePath, `${JSON.stringify(entry)}\n`, () => {});
  } catch (_) {
    // Never let logging take down the request
  }
};

const logSuccess = (payload) => writeLog('success', payload);
const logError = (payload) => writeLog('error', payload);

module.exports = {
  logSuccess,
  logError,
};
