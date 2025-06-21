const express = require('express');
const router = express.Router();
const updateController = require('../controllers/updateController');

// GET /api/updates/official/:id - Get official updates for a specific disaster
router.get('/official/:id', updateController.getOfficialUpdates);

module.exports = router;
