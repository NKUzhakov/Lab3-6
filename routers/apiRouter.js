const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainControllers.js');

// GET filtered trains
router.get('/trains/filter', trainController.filterTrainsApi);

// GET all trains with pagination
router.get('/trains', trainController.getAllTrainsApi);

// GET single train by ID
router.get('/trainByid', trainController.getTrainByIdApi);

// POST create new train
router.post('/trains/add', trainController.createTrainApi);

// PUT update train
router.post('/trains/update', trainController.updateTrainApi);

// DELETE train
router.post('/trains/delete', trainController.deleteTrainApi);

module.exports = router; 