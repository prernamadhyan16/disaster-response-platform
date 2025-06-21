const OfficialUpdatesService = require('../services/officialUpdatesService');
const Disaster = require('../models/disasterModel');

class UpdateController {
  async getOfficialUpdates(req, res) {
    try {
      const { id } = req.params; // Get disaster ID from URL params
      
      // Fetch the disaster to get its tags
      const disaster = await Disaster.getById(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      // Use disaster tags as keywords for searching updates
      const keywords = disaster.tags || [];
      
      console.log(`Fetching official updates for disaster ${id} with tags:`, keywords);
      
      const updates = await OfficialUpdatesService.getOfficialUpdates(id, keywords);
      
      res.json({
        disasterId: id,
        disaster: {
          title: disaster.title,
          tags: disaster.tags
        },
        updates,
        count: updates.length,
        keywords_used: keywords
      });
      
    } catch (error) {
      console.error('Error fetching official updates:', error);
      res.status(500).json({ 
        error: 'Failed to fetch official updates',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new UpdateController();
