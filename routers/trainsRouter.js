const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainControllers.js'); // Переконайтеся, що шлях правильний

router.get('/', trainController.getAllTrains);
router.get('/search', trainController.searchTrains);

module.exports = router;
