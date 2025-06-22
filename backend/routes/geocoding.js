const express = require('express');
const router = express.Router();
const geocodingController = require('../controllers/geocodingController');
const rateLimit = require('../middlewares/rateLimit');

router.post('/extract-location',
  rateLimit.geocodingLimiter,
  geocodingController.extractLocation
);

router.post('/geocode', 
  rateLimit.geocodingLimiter, 
  geocodingController.geocode
);
router.post('/reverse', 
  rateLimit.geocodingLimiter, 
  geocodingController.reverseGeocode
);
module.exports = router;
