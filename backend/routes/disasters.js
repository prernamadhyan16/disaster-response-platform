const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimit = require('../middlewares/rateLimit');

router.post('/', 
  authMiddleware, 
  rateLimit.createDisasterLimiter, 
  disasterController.createDisaster
);

router.get('/', disasterController.getDisasters);
router.get('/:id', disasterController.getDisasterById);
router.put('/:id', authMiddleware, disasterController.updateDisaster);
router.delete('/:id', authMiddleware, disasterController.deleteDisaster);
router.get('/:id/social-media', disasterController.getSocialMedia);
router.get('/:id/official-updates', disasterController.getOfficialUpdates);
router.get('/stats', disasterController.getStatistics);

module.exports = router;
