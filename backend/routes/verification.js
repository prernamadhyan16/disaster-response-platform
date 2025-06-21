const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const rateLimit = require('../middlewares/rateLimit');

router.post('/:id/verify-image', 
  rateLimit.verificationLimiter, 
  verificationController.verifyImage
);

router.get('/:id/verifications', 
  verificationController.getVerificationHistory
);

module.exports = router;
