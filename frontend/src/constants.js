// constants.js

export const API_BASE_URL = 'http://localhost:5000/api';
export const SOCKET_URL = 'http://localhost:5000/';

export const apiService = {
  async getDisasters(filters = {}) {
    try {
      console.log('Fetching disasters from:', `${API_BASE_URL}/disasters`);
      const response = await fetch(`${API_BASE_URL}/disasters`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Disasters data received:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching disasters:', error);
      // Return mock data for development
      return {
        disasters: [
          {
            id: 'disaster-1',
            title: 'Flood Emergency',
            location_name: 'Downtown Area',
            status: 'Active',
            severity: 'High',
            description: 'Heavy flooding in downtown area',
            created_at: new Date().toISOString()
          },
          {
            id: 'disaster-2',
            title: 'Earthquake Response',
            location_name: 'Suburban District',
            status: 'Active',
            severity: 'Medium',
            description: 'Earthquake damage assessment ongoing',
            created_at: new Date().toISOString()
          }
        ]
      };
    }
  },

  async createDisaster(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/disasters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating disaster:', error);
      throw new Error('Failed to create disaster');
    }
  },

  async updateDisaster(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/disasters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating disaster:', error);
      throw new Error('Failed to update disaster');
    }
  },

  async deleteDisaster(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/disasters/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting disaster:', error);
      throw new Error('Failed to delete disaster');
    }
  },

  async extractLocation(description) {
    try {
      const response = await fetch(`${API_BASE_URL}/geocoding/extract-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error extracting location:', error);
      throw new Error('Failed to extract location');
    }
  },

  async verifyImage(disasterId, imageUrl) {
    try {
      const response = await fetch(`${API_BASE_URL}/verification/verify-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disasterId, imageUrl })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error verifying image:', error);
      throw new Error('Failed to verify image');
    }
  },

  async createReport(reportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error('Failed to create report');
    }
  },

  async getSocialMedia(disasterId, keywords = null) {
    try {
      // Use provided keywords or fallback to default
      const searchKeywords = keywords || ['emergency', 'disaster', 'help'];
      console.log('Using keywords for social media search:', searchKeywords);

      const response = await fetch(`${API_BASE_URL}/social-media/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disasterId,
          keywords: searchKeywords
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching social media:', error);
      // Return mock data for development
      return {
        posts: [
          {
            id: 'mock_1',
            text: `Emergency situation developing for disaster ${disasterId}. Need assistance with supplies. #disaster #help`,
            author: '@citizen_reporter',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            likes: 15,
            reposts: 3,
            replies: 7,
            platform: 'mock',
            url: '#',
            analysis: {
              sentiment: 'negative',
              urgency: 'high',
              keywords: ['emergency', 'assistance', 'supplies'],
              needs_immediate_attention: true,
              relevance_score: 0.85
            }
          },
          {
            id: 'mock_2',
            text: `Shelter available for disaster ${disasterId} victims. Can accommodate 50 people. Contact us! #shelter #relief`,
            author: '@local_volunteer',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            likes: 42,
            reposts: 18,
            replies: 12,
            platform: 'mock',
            url: '#',
            analysis: {
              sentiment: 'positive',
              urgency: 'medium',
              keywords: ['shelter', 'relief', 'victims'],
              needs_immediate_attention: false,
              relevance_score: 0.75
            }
          },
          {
            id: 'mock_3',
            text: `Emergency services responding to disaster ${disasterId}. Please stay clear of affected areas. #emergency #safety`,
            author: '@emergency_services',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            likes: 89,
            reposts: 45,
            replies: 23,
            platform: 'mock',
            url: '#',
            analysis: {
              sentiment: 'neutral',
              urgency: 'high',
              keywords: ['emergency', 'services', 'safety'],
              needs_immediate_attention: true,
              relevance_score: 0.9
            }
          },
          {
            id: 'mock_4',
            text: `Medical supplies urgently needed for disaster ${disasterId} response. Blood donations welcome. #medical #donate`,
            author: '@medical_center',
            created_at: new Date(Date.now() - 5400000).toISOString(),
            likes: 156,
            reposts: 89,
            replies: 34,
            platform: 'mock',
            url: '#',
            analysis: {
              sentiment: 'negative',
              urgency: 'critical',
              keywords: ['medical', 'supplies', 'donate'],
              needs_immediate_attention: true,
              relevance_score: 0.95
            }
          }
        ]
      };
    }
  },

  // Helper function to extract keywords from text
  extractKeywords(text) {
    const commonKeywords = [
      'flood', 'earthquake', 'fire', 'storm', 'hurricane', 'tornado',
      'emergency', 'disaster', 'rescue', 'help', 'urgent', 'critical',
      'evacuation', 'shelter', 'medical', 'supplies', 'damage'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const extracted = commonKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    );
    
    // If no keywords found, use some default ones
    return extracted.length > 0 ? extracted : ['emergency', 'disaster', 'help'];
  }
}; 