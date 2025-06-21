const Resource = require('../models/resourceModel');
class ResourceController {
  async createResource(req, res) {
    try {
      const { disaster_id, name, type, location_name, lat, lng } = req.body;
      if (!disaster_id || !name || !type || !lat || !lng) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const location = `POINT(${lng} ${lat})`;
      const resourceData = { disaster_id, name, type, location_name, location };
      const resource = await Resource.create(resourceData);
      if (req.io) {
        req.io.emit('resource_updated', { action: 'create', resource });
      }
      res.status(201).json(resource);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  async getResources(req, res) {
    try {
      const { disaster_id, lat, lng, radius = 10 } = req.query;
      if (!disaster_id || !lat || !lng) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      const resources = await Resource.findNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius),
        disaster_id
      );
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
module.exports = new ResourceController();
