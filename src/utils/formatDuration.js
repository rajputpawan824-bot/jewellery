'use strict';

/**
 * Seconds to readable text for user messages.
 * 90 -> "1 minute 30 seconds", 300 -> "5 minutes", 45 -> "45 seconds", 3600 -> "60 minutes"
 */
const formatDuration = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const part = (n, unit) => (n ? `${n} ${unit}${n === 1 ? '' : 's'}` : '');
  return [part(minutes, 'minute'), part(seconds, 'second')].filter(Boolean).join(' ') || '0 seconds';
};

module.exports = formatDuration;
