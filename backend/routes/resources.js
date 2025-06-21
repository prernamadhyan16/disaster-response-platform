const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middlewares/authMiddleware');
router.post('/', 
  authMiddleware, 
  resourceController.createResource
);
router.get('/', 
  resourceController.getResources
);
module.exports = router;
