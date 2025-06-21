// const cheerio = require('cheerio');
// const cacheService = require('./cacheService');
// const puppeteer = require('puppeteer');

// class OfficialUpdatesService {
//   constructor() {
//     this.sources = [
//       {
//         name: 'FEMA',
//         url: 'https://search.usa.gov/search',
//         selector: '.search-result-item',
//         titleSelector: 'h2.result-title-label',
//         dateSelector: '',
//         contentSelector: '.result-desc',
//         linkSelector: 'a'
//       },
//       {
//         name: 'Red Cross',
//         url: 'https://www.redcross.org/about-us/news-and-events/news.html',
//         selector: '.newsroom-item',
//         titleSelector: 'h3',
//         dateSelector: '.date',
//         contentSelector: 'p',
//         linkSelector: 'a'
//       }
//     ];

//     this.requestDelay = 2000;
//     this.maxRetries = 3;
//     this.timeout = 25000; // Increased timeout for Puppeteer
//   }

//   async getOfficialUpdates(disasterId, keywords = []) {
//     const cacheKey = `official_updates_vFINAL_6_${disasterId}`; // Final cache invalidation
//     const cachedResult = await cacheService.get(cacheKey);
    
//     if (cachedResult) {
//       console.log('Official updates cache hit');
//       return cachedResult;
//     }

//     const allUpdates = [];

//     for (const source of this.sources) {
//       try {
//         console.log(`Scraping ${source.name} with Puppeteer...`);
//         const updates = await this.scrapeSourceWithRetry(source, keywords);
//         allUpdates.push(...updates);
        
//         if (this.sources.indexOf(source) < this.sources.length - 1) {
//           await this.delay(this.requestDelay);
//         }
//       } catch (error) {
//         console.error(`Error scraping ${source.name}:`, error.message);
//       }
//     }

//     if (allUpdates.length === 0) {
//         console.log("No real updates found, returning mock data.");
//         const mockUpdates = this.generateMockOfficialUpdates(keywords);
//         allUpdates.push(...mockUpdates);
//     }

//     const sortedUpdates = allUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
//     await cacheService.set(cacheKey, sortedUpdates, 60 * 60);
//     return sortedUpdates;
//   }

//   async scrapeSourceWithRetry(source, keywords) {
//     for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
//       try {
//         return await this.scrapeSource(source, keywords);
//       } catch (error) {
//         console.error(`Attempt ${attempt} failed for ${source.name}:`, error.message);
//         if (attempt === this.maxRetries) throw error;
//         const backoffDelay = this.requestDelay * Math.pow(2, attempt - 1);
//         await this.delay(backoffDelay);
//       }
//     }
//   }

//   async scrapeSource(source, keywords) {
//     let browser = null;
//     try {
//       let targetUrl = source.url;
//       if (source.name === 'FEMA' && keywords && keywords.length > 0) {
//         const query = encodeURIComponent(keywords.join(' '));
//         targetUrl = `https://search.usa.gov/search?affiliate=fema&query=${query}`;
//       }

//       browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
//       const page = await browser.newPage();
//       await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

//       // Wait for the results to appear on the page
//       console.log(`[${source.name}] Waiting for selector "${source.selector}" to appear...`);
//       await page.waitForSelector(source.selector, { timeout: 15000 });

//       // Take a final screenshot to confirm what we see
//       const screenshotPath = `backend/${source.name}_final_view.png`;
//       await page.screenshot({ path: screenshotPath, fullPage: true });
//       console.log(`[${source.name}] Final screenshot saved to: ${screenshotPath}`);
      
//       const pageContent = await page.content();
//       await browser.close();
      
//       const $ = cheerio.load(pageContent);
//       const updates = [];

//       $(source.selector).each((i, element) => {
//         try {
//           const $element = $(element);
//           const title = this.extractText($element, source.titleSelector);
//           const dateText = this.extractText($element, source.dateSelector);
//           const content = this.extractText($element, source.contentSelector);
//           const relativeLink = $element.find(source.linkSelector).first().attr('href');
          
//           if (title && content && title.length > 5) {
//             updates.push({
//               id: `${source.name.toLowerCase()}_${Date.now()}_${i}`,
//               title: title.substring(0, 200),
//               content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
//               date: this.parseDate(dateText) || new Date().toISOString(),
//               source: source.name,
//               url: relativeLink,
//               keywords_matched: this.getMatchedKeywords(title, content, keywords),
//               scraped_at: new Date().toISOString(),
//               relevance_score: this.calculateRelevanceScore(title, content, keywords)
//             });
//           }
//         } catch (elementError) {
//           console.error(`Error processing element from ${source.name}:`, elementError.message);
//         }
//       });
      
//       console.log(`[${source.name}] Found ${updates.length} relevant updates.`);
//       return updates;
//     } catch (error) {
//       console.error(`[${source.name}] Puppeteer scraping failed: ${error.message}`);
//       if (browser) await browser.close();
//       return [];
//     }
//   }

//   extractText($element, selectors) {
//     const selectorArray = selectors.split(', ');
//     for (const selector of selectorArray) {
//       const text = $element.find(selector).first().text().trim();
//       if (text) return text;
//     }
//     return '';
//   }

//   isContentRelevant(title, content, keywords) {
//     if (!keywords || keywords.length === 0) return true;
//     const combinedText = `${title} ${content}`.toLowerCase();
//     return keywords.some(keyword => combinedText.includes(keyword.toLowerCase()));
//   }

//   getMatchedKeywords(title, content, keywords) {
//     if (!keywords) return [];
//     const combinedText = `${title} ${content}`.toLowerCase();
//     return keywords.filter(keyword => combinedText.includes(keyword.toLowerCase()));
//   }

//   calculateRelevanceScore(title, content, keywords) {
//     if (!keywords || keywords.length === 0) return 0.5;
//     const combinedText = `${title} ${content}`.toLowerCase();
//     const matchCount = keywords.reduce((count, keyword) => {
//       const regex = new RegExp(keyword.toLowerCase(), 'g');
//       return count + (combinedText.match(regex) || []).length;
//     }, 0);
//     return Math.min(matchCount / keywords.length, 1.0);
//   }

//   buildFullUrl(relativeLink, baseUrl) {
//     if (!relativeLink) return baseUrl;
//     if (relativeLink.startsWith('http')) return relativeLink;
//     try {
//       return new URL(relativeLink, new URL(baseUrl).origin).href;
//     } catch (error) {
//       return baseUrl;
//     }
//   }

//   parseDate(dateText) {
//     if (!dateText) return null;
//     try {
//       const date = new Date(dateText);
//       if (!isNaN(date.getTime())) return date.toISOString();
      
//       const now = new Date();
//       const lowerText = dateText.toLowerCase();
//       if (lowerText.includes('hour')) return new Date(now.getTime() - (parseInt(lowerText) || 1) * 3600000).toISOString();
//       if (lowerText.includes('day')) return new Date(now.getTime() - (parseInt(lowerText) || 1) * 86400000).toISOString();
//       if (lowerText.includes('week')) return new Date(now.getTime() - (parseInt(lowerText) || 1) * 604800000).toISOString();
//       return null;
//     } catch {
//       return null;
//     }
//   }

//   generateMockOfficialUpdates(keywords) {
//     const keywordText = keywords && keywords.length > 0 ? keywords[0] : 'disaster';
//     return [
//       { id: 'fema_mock_1', title: `FEMA Responds to ${keywordText} Event`, content: `Federal Emergency Management Agency has deployed resources...`, date: new Date(Date.now() - 7200000).toISOString(), source: 'FEMA', url: '#', relevance_score: 1.0 },
//       { id: 'redcross_mock_1', title: `Red Cross Mobilizes for ${keywordText} Relief`, content: `American Red Cross volunteers are providing emergency assistance...`, date: new Date(Date.now() - 14400000).toISOString(), source: 'Red Cross', url: '#', relevance_score: 1.0 },
//     ];
//   }

//   delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
// }

// module.exports = new OfficialUpdatesService();




const axios = require('axios');
const CacheService = require('./cacheService');

class OfficialUpdatesService {
  constructor() {
    this.sources = [
      {
        name: 'FEMA',
        type: 'api',
        baseUrl: 'https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations',
        enabled: true
      },
      {
        name: 'FEMA News',
        type: 'api', 
        baseUrl: 'https://www.fema.gov/api/open/v1/FemaWebNewsReleases',
        enabled: true
      },
      {
        name: 'Red Cross',
        type: 'mock',
        enabled: true
      }
    ];

    this.requestDelay = 1000;
    this.maxRetries = 3;
    this.timeout = 10000;
  }

  async getOfficialUpdates(disasterId, keywords = []) {
    const cacheKey = `official_updates_${disasterId}`;
    const cachedResult = await CacheService.get(cacheKey);
    
    if (cachedResult) {
      console.log('Official updates cache hit');
      return cachedResult;
    }

    const allUpdates = [];

    // Process each source
    for (const source of this.sources) {
      try {
        console.log(`Fetching updates from ${source.name}...`);
        let updates = [];

        if (source.name === 'FEMA' && source.type === 'api') {
          updates = await this.getFEMADisasterData(keywords);
        } else if (source.name === 'FEMA News' && source.type === 'api') {
          updates = await this.getFEMANewsData(keywords);
        } else if (source.type === 'mock') {
          updates = this.generateMockOfficialUpdates(source.name, keywords);
        }

        allUpdates.push(...updates);
        
        // Rate limiting between sources
        if (this.sources.indexOf(source) < this.sources.length - 1) {
          await this.delay(this.requestDelay);
        }
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error.message);
      }
    }

    // If no real updates found, generate mock data
    if (allUpdates.length === 0) {
      console.log("No real updates found, returning mock data.");
      const mockUpdates = this.generateMockOfficialUpdates('Emergency Management', keywords);
      allUpdates.push(...mockUpdates);
    }

    // Sort by date (newest first)
    const sortedUpdates = allUpdates.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Cache results for 1 hour
    await CacheService.set(cacheKey, sortedUpdates, 60 * 60);
    return sortedUpdates;
  }

  async getFEMADisasterData(keywords) {
    try {
      const url = 'https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations';
      
      // Build filter conditions for keywords
      let filterConditions = [];
      if (keywords && keywords.length > 0) {
        keywords.forEach(keyword => {
          const keywordProper = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
          filterConditions.push(`contains(disasterName,'${keywordProper}')`);
          filterConditions.push(`contains(incidentType,'${keywordProper}')`);
        });
      }

      const params = {
        '$orderby': 'declarationDate desc',
        '$top': 10,
        '$format': 'json'
      };

      if (filterConditions.length > 0) {
        params['$filter'] = filterConditions.join(' or ');
      }

      const response = await axios.get(url, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'DisasterResponsePlatform/1.0'
        }
      });

      const disasters = response.data.FemaWebDisasterDeclarations || [];
      
      return disasters.map((disaster, index) => ({
        id: `fema_disaster_${disaster.disasterNumber}_${Date.now()}_${index}`,
        title: disaster.disasterName || 'FEMA Disaster Declaration',
        content: `${disaster.declarationType} declared for ${disaster.stateName}. Incident type: ${disaster.incidentType}. ${disaster.iaProgramDeclared ? 'Individual Assistance available.' : ''} ${disaster.paProgramDeclared ? 'Public Assistance available.' : ''}`,
        date: disaster.declarationDate || new Date().toISOString(),
        source: 'FEMA',
        url: disaster.disasterPageUrl || 'https://www.fema.gov/disasters',
        keywords_matched: this.getMatchedKeywords(
          `${disaster.disasterName} ${disaster.incidentType}`, 
          '', 
          keywords
        ),
        scraped_at: new Date().toISOString(),
        relevance_score: this.calculateRelevanceScore(
          disaster.disasterName || '', 
          disaster.incidentType || '', 
          keywords
        )
      }));

    } catch (error) {
      console.error('FEMA API error:', error.message);
      return [];
    }
  }

  async getFEMANewsData(keywords) {
    try {
      // Since FEMA News API might not be available, we'll simulate with recent disasters
      const url = 'https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations';
      
      const params = {
        '$orderby': 'declarationDate desc',
        '$top': 5,
        '$format': 'json'
      };

      const response = await axios.get(url, {
        params,
        timeout: this.timeout
      });

      const disasters = response.data.FemaWebDisasterDeclarations || [];
      
      return disasters.map((disaster, index) => ({
        id: `fema_news_${disaster.disasterNumber}_${Date.now()}_${index}`,
        title: `FEMA News: Response to ${disaster.disasterName}`,
        content: `FEMA has declared a ${disaster.declarationType} for ${disaster.stateName} due to ${disaster.incidentType}. Federal assistance is being coordinated to support local response efforts.`,
        date: disaster.declarationDate || new Date().toISOString(),
        source: 'FEMA News',
        url: disaster.disasterPageUrl || 'https://www.fema.gov/news-release',
        keywords_matched: this.getMatchedKeywords(
          disaster.disasterName || '', 
          disaster.incidentType || '', 
          keywords
        ),
        scraped_at: new Date().toISOString(),
        relevance_score: 0.9
      }));

    } catch (error) {
      console.error('FEMA News API error:', error.message);
      return [];
    }
  }

  getMatchedKeywords(title, content, keywords) {
    if (!keywords || keywords.length === 0) return [];
    
    const combinedText = `${title} ${content}`.toLowerCase();
    return keywords.filter(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
  }

  calculateRelevanceScore(title, content, keywords) {
    if (!keywords || keywords.length === 0) return 0.5;
    
    const combinedText = `${title} ${content}`.toLowerCase();
    const matchCount = keywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = combinedText.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    return Math.min(matchCount / keywords.length, 1.0);
  }

  generateMockOfficialUpdates(sourceName, keywords) {
    const keywordText = keywords && keywords.length > 0 ? keywords[0] : 'disaster';
    
    return [
      {
        id: `${sourceName.toLowerCase().replace(/\s+/g, '_')}_mock_1`,
        title: `${sourceName} Responds to ${keywordText.charAt(0).toUpperCase() + keywordText.slice(1)} Event`,
        content: `${sourceName} has deployed emergency response teams to assist communities affected by the recent ${keywordText}. Relief supplies including food, water, and emergency shelter materials are being distributed to impacted areas.`,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: sourceName,
        url: sourceName === 'Red Cross' ? 'https://www.redcross.org/about-us/news-and-events' : '#',
        keywords_matched: keywords || [],
        scraped_at: new Date().toISOString(),
        relevance_score: 1.0
      },
      {
        id: `${sourceName.toLowerCase().replace(/\s+/g, '_')}_mock_2`,
        title: `Emergency Resources Available for ${keywordText.charAt(0).toUpperCase() + keywordText.slice(1)} Victims`,
        content: `Emergency assistance programs are now available for individuals and families affected by the ${keywordText}. Services include temporary housing, financial assistance, and crisis counseling.`,
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: sourceName,
        url: sourceName === 'Red Cross' ? 'https://www.redcross.org/get-help' : '#',
        keywords_matched: keywords || [],
        scraped_at: new Date().toISOString(),
        relevance_score: 0.9
      },
      {
        id: `${sourceName.toLowerCase().replace(/\s+/g, '_')}_mock_3`,
        title: `Coordinated Emergency Operations for ${keywordText.charAt(0).toUpperCase() + keywordText.slice(1)} Response`,
        content: `Local, state, and federal agencies are working together to coordinate emergency response operations. Residents in affected areas should follow official evacuation orders and stay informed through emergency alert systems.`,
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: sourceName,
        url: '#',
        keywords_matched: keywords || [],
        scraped_at: new Date().toISOString(),
        relevance_score: 0.8
      }
    ];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new OfficialUpdatesService();
