const supabase = require('../config/supabase');
class ResourceModel {
  async create(data) {
    const { data: resource, error } = await supabase
      .from('resources')
      .insert([data])
      .select();
    if (error) throw error;
    return resource[0];
  }
  async findNearby(lat, lng, radius, disaster_id) {
    const { data, error } = await supabase.rpc('resources_nearby', {
      lat,
      lng,
      radius_meters: radius * 1000,
      disaster_id
    });
    if (error) throw error;
    return data;
  }
}
module.exports = new ResourceModel();
