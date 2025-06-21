# Social Media Service Setup

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here

# Bluesky Social Media Integration
BLUESKY_HANDLE=your_bluesky_handle_here
BLUESKY_APP_PASSWORD=your_bluesky_app_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache Configuration
CACHE_TTL_SECONDS=3600
```

## Bluesky Setup

1. Create a Bluesky account at https://bsky.app
2. Go to Settings > App Passwords
3. Create a new app password
4. Use your handle (e.g., `@yourname.bsky.social`) and the app password in the environment variables

## Features

The enhanced social media service now includes:

### Real-time Social Media Monitoring
- **Bluesky Integration**: Fetches real posts from Bluesky social media platform
- **Fallback Mock Data**: Provides realistic mock data when real data is unavailable
- **Caching**: Intelligent caching to reduce API calls and improve performance

### AI-Powered Analysis
- **Sentiment Analysis**: Analyzes post sentiment (positive, negative, neutral, urgent)
- **Urgency Detection**: Identifies critical posts that need immediate attention
- **Keyword Extraction**: Extracts relevant keywords for better categorization
- **Relevance Scoring**: Calculates relevance scores based on engagement and content

### Enhanced Data Structure
Each social media post now includes:
```json
{
  "id": "post_id",
  "text": "Post content",
  "author": "@username",
  "created_at": "2024-01-01T12:00:00Z",
  "likes": 42,
  "reposts": 18,
  "replies": 12,
  "platform": "bluesky|mock",
  "url": "https://bsky.app/profile/...",
  "analysis": {
    "sentiment": "urgent|positive|negative|neutral",
    "urgency": "critical|high|medium|low",
    "keywords": ["emergency", "help", "shelter"],
    "needs_immediate_attention": true,
    "relevance_score": 0.85
  }
}
```

### Smart Sorting
Posts are automatically sorted by:
1. Urgency level (critical > high > medium > low)
2. Relevance score
3. Engagement metrics

## API Endpoints

### GET /api/social-media/posts
Fetches and analyzes social media posts based on keywords.

**Request Body:**
```json
{
  "keywords": ["flood", "emergency", "help"]
}
```

**Response:**
```json
{
  "posts": [
    {
      "id": "mock_1",
      "text": "flood situation developing. Need assistance with supplies. #disaster #help",
      "author": "@citizen_reporter",
      "created_at": "2024-01-01T11:00:00Z",
      "likes": 15,
      "reposts": 3,
      "replies": 7,
      "platform": "mock",
      "url": "#",
      "analysis": {
        "sentiment": "urgent",
        "urgency": "critical",
        "keywords": ["flood", "assistance", "supplies"],
        "needs_immediate_attention": true,
        "relevance_score": 0.95
      }
    }
  ]
}
```

## Usage Examples

### Basic Usage
```javascript
const response = await fetch('/api/social-media/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: ['earthquake', 'emergency']
  })
});

const data = await response.json();
console.log(data.posts);
```

### Filtering by Urgency
```javascript
const criticalPosts = data.posts.filter(post => 
  post.analysis.urgency === 'critical'
);
```

### Sorting by Relevance
```javascript
const sortedPosts = data.posts.sort((a, b) => 
  b.analysis.relevance_score - a.analysis.relevance_score
);
``` 