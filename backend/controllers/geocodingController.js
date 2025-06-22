const GeocodingService = require('../services/geocodingService');
const geminiService = require('../services/geminiService');

class GeocodingController {
  async extractLocation(req, res) {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
      const location_name = await geminiService.extractLocation(description);
      if (!location_name) {
        return res.status(404).json({ error: 'Could not extract a location' });
      }
      res.json({ location_name });
    } catch (error) {
      console.error('Location extraction error:', error);
      res.status(500).json({ error: 'Location extraction failed' });
    }
  }
  async geocode(req, res) {
    try {
      const { location } = req.body;
      if (!location) {
        return res.status(400).json({ error: 'Location text is required' });
      }
      const coordinates = await GeocodingService.geocode(location);
      if (!coordinates) {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.json({ location, coordinates });
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ error: 'Geocoding failed' });
    }
  }
  async reverseGeocode(req, res) {
    try {
      const { lat, lng } = req.body;
      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      const address = await GeocodingService.reverseGeocode(lat, lng);
      res.json({ coordinates: { lat, lng }, address });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      res.status(500).json({ error: 'Reverse geocoding failed' });
    }
  }
}
module.exports = new GeocodingController();
