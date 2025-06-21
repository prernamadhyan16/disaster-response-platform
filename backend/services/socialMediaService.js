const axios = require('axios');
const { AtpAgent } = require('@atproto/api');
const CacheService = require('./cacheService');
const geminiService = require('./geminiService');

class SocialMediaService {
  constructor() {
    this.blueskyAgent = null;
    this.initializeBluesky();
  }

  async initializeBluesky() {
    if (process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD) {
      try {
        this.blueskyAgent = new AtpAgent({
          service: 'https://bsky.social'
        });
        
        await this.blueskyAgent.login({
          identifier: process.env.BLUESKY_HANDLE,
          password: process.env.BLUESKY_APP_PASSWORD
        });
        
        console.log('Bluesky API initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Bluesky API:', error);
        this.blueskyAgent = null;
      }
    }
  }

  async getSocialMediaPosts(keywords, disasterId) {
    const cacheKey = `social_v2_${keywords.join('_')}`;
    console.log('Cache key generated:', cacheKey);
    console.log('Keywords for cache:', keywords);
    
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) {
      console.log('Social media cache hit for key:', cacheKey);
      return cachedResult;
    }

    console.log('No cache hit, fetching fresh data for key:', cacheKey);

    let posts = [];

    if (this.blueskyAgent) {
      const blueskyPosts = await this.getBlueskyPosts(keywords);
      posts = posts.concat(blueskyPosts);
    }

    if (posts.length === 0) {
      posts = this.generateMockPosts(keywords, disasterId);
    }

    const analyzedPosts = await this.analyzePosts(posts);

    await CacheService.set(cacheKey, analyzedPosts, 30 * 60);

    return analyzedPosts;
  }

  async getBlueskyPosts(keywords) {
    if (!this.blueskyAgent) {
      return [];
    }

    try {
      const searchQuery = keywords.join(' OR ');
      const response = await this.blueskyAgent.api.app.bsky.feed.searchPosts({
        q: searchQuery,
        limit: 25
      });

      return response.data.posts.map(post => ({
        id: post.uri,
        text: post.record.text,
        author: post.author.handle,
        created_at: post.record.createdAt,
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replies: post.replyCount || 0,
        platform: 'bluesky',
        url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`
      }));
    } catch (error) {
      console.error('Error fetching Bluesky posts:', error);
      return [];
    }
  }

  generateMockPosts(keywords, disasterId) {
    const mockPosts = [
      {
        id: 'mock_1',
        text: `${keywords[0]} situation developing. Need assistance with supplies. #disaster #help`,
        author: '@citizen_reporter',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        likes: 15,
        reposts: 3,
        replies: 7,
        platform: 'mock',
        url: '#'
      },
      {
        id: 'mock_2',
        text: `Shelter available for ${keywords[0]} victims. Can accommodate 50 people. Contact us! #shelter #relief`,
        author: '@local_volunteer',
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        likes: 42,
        reposts: 18,
        replies: 12,
        platform: 'mock',
        url: '#'
      },
      {
        id: 'mock_3',
        text: `Emergency services responding to ${keywords[0]}. Please stay clear of affected areas. #emergency #safety`,
        author: '@emergency_services',
        created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        likes: 89,
        reposts: 45,
        replies: 23,
        platform: 'mock',
        url: '#'
      },
      {
        id: 'mock_4',
        text: `Medical supplies urgently needed for ${keywords[0]} response. Blood donations welcome. #medical #donate`,
        author: '@medical_center',
        created_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        likes: 156,
        reposts: 89,
        replies: 34,
        platform: 'mock',
        url: '#'
      }
    ];

    return mockPosts;
  }

  async analyzePosts(posts) {
    const analyzedPosts = [];

    for (const post of posts) {
      try {
        const analysis = await geminiService.analyzeSentiment(post.text);
        
        analyzedPosts.push({
          ...post,
          analysis: {
            sentiment: analysis.sentiment,
            urgency: analysis.urgency,
            keywords: analysis.keywords,
            needs_immediate_attention: analysis.needs_immediate_attention,
            relevance_score: this.calculateRelevanceScore(post, analysis)
          }
        });
      } catch (error) {
        console.error('Error analyzing post:', error);
        analyzedPosts.push({
          ...post,
          analysis: {
            sentiment: 'neutral',
            urgency: 'medium',
            keywords: [],
            needs_immediate_attention: false,
            relevance_score: 0.5
          }
        });
      }
    }

    // Sort by relevance score and urgency
    return analyzedPosts.sort((a, b) => {
      const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aScore = (urgencyWeight[a.analysis.urgency] || 2) * a.analysis.relevance_score;
      const bScore = (urgencyWeight[b.analysis.urgency] || 2) * b.analysis.relevance_score;
      return bScore - aScore;
    });
  }

  calculateRelevanceScore(post, analysis) {
    let score = 0.5; // Base score

    // Boost score for high engagement
    const totalEngagement = (post.likes || 0) + (post.reposts || 0) + (post.replies || 0);
    score += Math.min(totalEngagement / 100, 0.3);

    // Boost score for official accounts
    if (post.author.includes('emergency') || post.author.includes('official')) {
      score += 0.2;
    }

    // Boost score for urgent keywords
    const urgentKeywords = ['emergency', 'urgent', 'help', 'rescue', 'danger', 'critical'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      post.text.toLowerCase().includes(keyword)
    );
    if (hasUrgentKeywords) {
      score += 0.2;
    }

    // Boost score for needs/offers
    const needsOffers = ['need', 'offer', 'available', 'donate', 'shelter', 'food', 'medical'];
    const hasNeedsOffers = needsOffers.some(keyword => 
      post.text.toLowerCase().includes(keyword)
    );
    if (hasNeedsOffers) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }
}

module.exports = new SocialMediaService();
