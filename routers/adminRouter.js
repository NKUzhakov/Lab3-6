const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminControllers.js'); 


router.get('/', controller.getAdminPanel);
router.get('/search', controller.getSearchPanel);

module.exports = router;
