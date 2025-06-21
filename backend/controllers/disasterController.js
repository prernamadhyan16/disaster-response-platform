const Disaster = require('../models/disasterModel');
const GeminiService = require('../services/geminiService');
const GeocodingService = require('../services/geocodingService');
const SocialMediaService = require('../services/socialMediaService');
const OfficialUpdatesService = require('../services/officialUpdatesService');
class DisasterController {
  async createDisaster(req, res) {
    try {
      const { title, description, tags } = req.body;
      const userId = req.user?.id || 'anonymous';
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }
      const locationName = await GeminiService.extractLocation(description);
      let coordinates = null;
      let location = null;
      if (locationName && locationName !== 'Location not specified') {
        coordinates = await GeocodingService.geocode(locationName);
        if (coordinates) {
          location = `POINT(${coordinates.lng} ${coordinates.lat})`;
        }
      }
      const disasterData = {
        title,
        description,
        location_name: locationName,
        location: location,
        tags: tags || [],
        owner_id: userId,
        status: 'active'
      };
      const disaster = await Disaster.create(disasterData);
      if (req.io) {
        req.io.emit('disaster_updated', { action: 'create', disaster: { ...disaster, coordinates } });
      }
      res.status(201).json({ ...disaster, coordinates, message: 'Disaster created successfully' });
    } catch (error) {
      console.error('Error creating disaster:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
  async getDisasters(req, res) {
    try {
      const filters = {
        tag: req.query.tag,
        status: req.query.status,
        owner_id: req.query.owner_id,
        limit: parseInt(req.query.limit) || 50
      };
      if (req.query.lat && req.query.lng) {
        filters.location = {
          lat: parseFloat(req.query.lat),
          lng: parseFloat(req.query.lng),
          radius: parseFloat(req.query.radius) || 50
        };
      }
      const disasters = await Disaster.getAll(filters);
      res.json({ disasters, count: disasters.length, filters });
    } catch (error) {
      console.error('Error fetching disasters:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  async getDisasterById(req, res) {
    try {
      const { id } = req.params;
      const disaster = await Disaster.getById(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }
      res.json(disaster);
    } catch (error) {
      console.error('Error fetching disaster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  async updateDisaster(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'anonymous';
      const updateData = req.body;
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.audit_trail;
      const disaster = await Disaster.update(id, updateData, userId);
      if (req.io) {
        req.io.emit('disaster_updated', { action: 'update', disaster });
      }
      res.json({ ...disaster, message: 'Disaster updated successfully' });
    } catch (error) {
      console.error('Error updating disaster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  async deleteDisaster(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'anonymous';
      await Disaster.delete(id, userId);
      if (req.io) {
        req.io.emit('disaster_updated', { action: 'delete', disasterId: id });
      }
      res.json({ message: 'Disaster deleted successfully' });
    } catch (error) {
      console.error('Error deleting disaster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  async getSocialMedia(req, res) {
    try {
      const { id } = req.params;
      const disaster = await Disaster.getById(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }
      const keywords = [
        disaster.title.split(' ').slice(0, 2).join(' '),
        disaster.location_name,
        ...(disaster.tags || [])
      ].filter(Boolean);
      const socialMediaPosts = await SocialMediaService.getSocialMediaPosts(keywords, id);
      if (req.io) {
        req.io.to(`disaster_${id}`).emit('social_media_updated', { disasterId: id, posts: socialMediaPosts });
      }
      res.json({ disasterId: id, keywords, posts: socialMediaPosts, count: socialMediaPosts.length });
    } catch (error) {
      console.error('Error fetching social media:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  async getOfficialUpdates(req, res) {
    try {
      const { id } = req.params;
      const disaster = await Disaster.getById(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }
      const keywords = [disaster.title, disaster.location_name, ...(disaster.tags || [])];
      const updates = await OfficialUpdatesService.getOfficialUpdates(id, keywords);
      res.json({ disasterId: id, updates, count: updates.length });
    } catch (error) {
      console.error('Error fetching official updates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  async getStatistics(req, res) {
    try {
      const stats = await Disaster.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
module.exports = new DisasterController();
