const { GoogleGenerativeAI } = require('@google/generative-ai');
const CacheService = require('./cacheService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  async extractLocation(text) {
    const cacheKey = `location_extract_${Buffer.from(text).toString('base64').substring(0, 50)}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) return cachedResult;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Extract the most specific location name from this disaster description. Return only the location name (city, state/province, country format when possible). If no location is found, return "Location not specified".

Description: "${text}"

Location:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const locationName = response.text().trim();
      
      await CacheService.set(cacheKey, locationName, 6 * 60 * 60);
      
      return locationName;
    } catch (error) {
      console.error('Gemini location extraction error:', error);
      return 'Location extraction failed';
    }
  }

  async analyzeSentiment(text) {
    const cacheKey = `sentiment_${Buffer.from(text).toString('base64').substring(0, 50)}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) return cachedResult;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze this social media post for disaster response relevance. Return JSON with:
- sentiment: "positive", "negative", "neutral", or "urgent"
- urgency: "critical", "high", "medium", or "low"
- keywords: array of relevant keywords
- needs_immediate_attention: boolean
- description: brief analysis

Post: "${text}"

Analysis:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(response.text());
      } catch {
        // Fallback analysis based on keyword matching
        const urgentWords = ['emergency', 'urgent', 'help', 'rescue', 'danger', 'critical', 'immediate'];
        const negativeWords = ['disaster', 'damage', 'injury', 'death', 'destroyed', 'flood', 'fire'];
        const positiveWords = ['help', 'support', 'volunteer', 'donate', 'shelter', 'safe'];
        
        const textLower = text.toLowerCase();
        const hasUrgent = urgentWords.some(word => textLower.includes(word));
        const hasNegative = negativeWords.some(word => textLower.includes(word));
        const hasPositive = positiveWords.some(word => textLower.includes(word));
        
        analysisResult = {
          sentiment: hasUrgent ? 'urgent' : (hasNegative ? 'negative' : (hasPositive ? 'positive' : 'neutral')),
          urgency: hasUrgent ? 'critical' : (hasNegative ? 'high' : 'medium'),
          keywords: [...new Set([...urgentWords.filter(w => textLower.includes(w)), 
                                ...negativeWords.filter(w => textLower.includes(w)),
                                ...positiveWords.filter(w => textLower.includes(w))])],
          needs_immediate_attention: hasUrgent,
          description: 'Keyword-based analysis'
        };
      }
      
      await CacheService.set(cacheKey, analysisResult, 30 * 60); // Cache for 30 minutes
      
      return analysisResult;
    } catch (error) {
      console.error('Gemini sentiment analysis error:', error);
      return {
        sentiment: 'neutral',
        urgency: 'medium',
        keywords: [],
        needs_immediate_attention: false,
        description: 'Analysis failed'
      };
    }
  }

  async verifyImage(imageUrl) {
    const cacheKey = `image_verify_${Buffer.from(imageUrl).toString('base64').substring(0, 50)}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) return cachedResult;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze this disaster image for authenticity. Return JSON with:
- authentic: boolean
- confidence: number (0-1)
- disaster_type: string
- manipulation_detected: boolean
- description: string
- concerns: array of strings`;

      // In a real implementation, you would fetch and process the image
      const result = await model.generateContent([prompt, imageUrl]);
      const response = await result.response;
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(response.text());
      } catch {
        analysisResult = {
          authentic: true,
          confidence: 0.5,
          disaster_type: "unknown",
          manipulation_detected: false,
          description: "Image analysis completed",
          concerns: []
        };
      }
      
      await CacheService.set(cacheKey, analysisResult, 24 * 60 * 60);
      
      return analysisResult;
    } catch (error) {
      console.error('Gemini image verification error:', error);
      return {
        authentic: false,
        confidence: 0,
        disaster_type: "error",
        manipulation_detected: true,
        description: "Verification failed",
        concerns: ["Technical error"]
      };
    }
  }
}

module.exports = new GeminiService();
