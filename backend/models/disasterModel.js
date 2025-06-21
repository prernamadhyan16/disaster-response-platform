const supabase = require('../config/supabase');

class DisasterModel {
  async create(data) {
    try {
      const { data: disaster, error } = await supabase
        .from('disasters')
        .insert([{
          ...data,
          audit_trail: [{ 
            action: 'create', 
            user_id: data.owner_id || 'system', 
            timestamp: new Date().toISOString() 
          }]
        }])
        .select()
        .single();
      
      if (error) throw error;
      return disaster;
    } catch (error) {
      console.error('Error creating disaster:', error);
      throw error;
    }
  }

  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('disasters')
        .select('*');
      
      if (filters.tag) {
        query = query.contains('tags', [filters.tag]);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id);
      }
      
      if (filters.location && filters.radius) {
        query = query.rpc('disasters_within_radius', {
          lat: filters.location.lat,
          lng: filters.location.lng,
          radius_meters: filters.location.radius * 1000
        });
      }
      
      query = query.order('created_at', { ascending: false });
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching disasters:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select(`
          *,
          reports(*),
          resources(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching disaster by ID:', error);
      throw error;
    }
  }

  async update(id, data, userId = 'system') {
    try {
      const { data: currentData } = await supabase
        .from('disasters')
        .select('audit_trail')
        .eq('id', id)
        .single();
      
      const currentAuditTrail = currentData?.audit_trail || [];
      
      const { data: disaster, error } = await supabase
        .from('disasters')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          audit_trail: [
            ...currentAuditTrail,
            { 
              action: 'update', 
              user_id: userId, 
              timestamp: new Date().toISOString(),
              changes: Object.keys(data)
            }
          ]
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return disaster;
    } catch (error) {
      console.error('Error updating disaster:', error);
      throw error;
    }
  }

  async delete(id, userId = 'system') {
    try {
      const { error } = await supabase
        .from('disasters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting disaster:', error);
      throw error;
    }
  }

  async findNearby(lat, lng, radiusKm = 50) {
    try {
      const { data, error } = await supabase
        .rpc('disasters_within_radius', {
          lat: lat,
          lng: lng,
          radius_meters: radiusKm * 1000
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding nearby disasters:', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .rpc('get_disaster_statistics');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting disaster statistics:', error);
      throw error;
    }
  }
}

module.exports = new DisasterModel();
