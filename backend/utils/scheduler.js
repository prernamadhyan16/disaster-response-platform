const CacheService = require('../services/cacheService');

function setupScheduledTasks() {
  // Clear expired cache entries every hour
  setInterval(() => {
    CacheService.clearExpired()
      .then(() => console.log('Cleared expired cache entries'))
      .catch(err => console.error('Cache cleanup error:', err));
  }, 60 * 60 * 1000);
}

module.exports = { setupScheduledTasks };
