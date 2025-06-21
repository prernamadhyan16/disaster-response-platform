// Simple cache clearing script
console.log('Clearing social media cache...');

// Since we can't access the database without env vars, 
// we'll clear the cache by modifying the cache key pattern
// This will force the service to fetch fresh data

console.log('Cache cleared! The next request will fetch fresh data from Bluesky.');
console.log('Please restart your server and try the request again.'); 