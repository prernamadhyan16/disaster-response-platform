const supabase = require('../config/supabase');
class ReportModel {
  async create(data) {
    const { data: report, error } = await supabase
      .from('reports')
      .insert([data])
      .select();
    if (error) throw error;
    return report[0];
  }
  async findByDisaster(disaster_id) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('disaster_id', disaster_id);
    if (error) throw error;
    return data;
  }
}
module.exports = new ReportModel();
