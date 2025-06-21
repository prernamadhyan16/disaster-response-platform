require('dotenv').config();
const CacheService = require('./services/cacheService');

async function clearSocialMediaCache() {
  try {
    console.log('Clearing social media cache...');
    
    // Clear all cache entries that start with 'social_v2_'
    const { data, error } = await require('./config/supabase')
      .from('cache')
      .delete()
      .like('key', 'social_v2_%');
    
    if (error) {
      console.error('Error clearing cache:', error);
    } else {
      console.log('Social media cache cleared successfully!');
      console.log('Next request will fetch fresh data from Bluesky.');
    }
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

clearSocialMediaCache(); 