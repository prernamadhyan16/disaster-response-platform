const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

// Anyone can submit a report, but we'll try to get the user ID if they are logged in.
router.post('/', authMiddleware.optional, reportController.createReport);

// Route to get all reports for a specific disaster
router.get('/disaster/:disaster_id', reportController.getReportsForDisaster);

module.exports = router; 