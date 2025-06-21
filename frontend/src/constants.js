// constants.js

export const API_BASE_URL = 'https://disaster-response-platform-backend.onrender.com/api';
export const SOCKET_URL = 'https://disaster-response-platform-backend.onrender.com/';

export const apiService = {
  async getDisasters(filters = {}) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },
  async createDisaster(data) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },
  async updateDisaster(id, data) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },
  async deleteDisaster(id) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },
  async extractLocation(description) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },
  async verifyImage(disasterId, imageUrl) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  },
  async getSocialMedia(disasterId) {
    // TODO: Implement real API call
    throw new Error('Not implemented');
  }
}; 