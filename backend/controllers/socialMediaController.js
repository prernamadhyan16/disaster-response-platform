const SocialMediaService = require('../services/socialMediaService');
class SocialMediaController {
  async getSocialMediaPosts(req, res) {
    try {
      const { keywords, disasterId } = req.body;
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'Keywords array is required' });
      }
      const posts = await SocialMediaService.getSocialMediaPosts(keywords, disasterId);
      res.json({ posts });
    } catch (error) {
      console.error('Error fetching social media posts:', error);
      res.status(500).json({ error: 'Failed to fetch social media posts' });
    }
  }
}
module.exports = new SocialMediaController();
