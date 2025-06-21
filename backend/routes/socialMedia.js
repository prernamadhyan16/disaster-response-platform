const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');
router.post('/posts', 
  socialMediaController.getSocialMediaPosts
);
module.exports = router;
