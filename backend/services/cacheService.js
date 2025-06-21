const supabase = require('../config/supabase');

class CacheService {
  static async get(key) {
    const { data, error } = await supabase
      .from('cache')
      .select('value')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) return null;
    return data.value;
  }

  static async set(key, value, ttlSeconds = 3600) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);
    
    const { error } = await supabase
      .from('cache')
      .upsert({ 
        key, 
        value, 
        expires_at: expiresAt.toISOString() 
      });
    
    if (error) console.error('Cache set error:', error);
  }

  static async delete(key) {
    const { error } = await supabase
      .from('cache')
      .delete()
      .eq('key', key);
    
    if (error) console.error('Cache delete error:', error);
  }

  static async clearExpired() {
    const { error } = await supabase
      .from('cache')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) console.error('Clear expired cache error:', error);
  }
}

module.exports = CacheService;
