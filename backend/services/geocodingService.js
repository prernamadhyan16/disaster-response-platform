const axios = require('axios');
const CacheService = require('./cacheService');

class GeocodingService {
  async geocode(locationName) {
    if (!locationName || locationName === 'Location not specified') {
      return null;
    }

    const cacheKey = `geocode_${locationName.replace(/\s+/g, '_').toLowerCase()}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) return cachedResult;

    // Try Google Maps first
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
              address: locationName,
              key: process.env.GOOGLE_MAPS_API_KEY
            }
          }
        );
        
        if (response.data.results.length > 0) {
          const result = {
            lat: response.data.results[0].geometry.location.lat,
            lng: response.data.results[0].geometry.location.lng,
            formatted_address: response.data.results[0].formatted_address,
            provider: 'google'
          };
          
          await CacheService.set(cacheKey, result, 24 * 60 * 60);
          return result;
        }
      } catch (error) {
        console.error('Google Maps geocoding error:', error);
      }
    }

    // Fallback to OpenStreetMap
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search', {
          params: {
            q: locationName,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'DisasterResponsePlatform/1.0'
          }
        }
      );
      
      if (response.data.length > 0) {
        const result = {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
          formatted_address: response.data[0].display_name,
          provider: 'openstreetmap'
        };
        
        await CacheService.set(cacheKey, result, 24 * 60 * 60);
        return result;
      }
    } catch (error) {
      console.error('OpenStreetMap geocoding error:', error);
    }

    console.error('All geocoding services failed for:', locationName);
    return null;
  }
}

module.exports = new GeocodingService();
