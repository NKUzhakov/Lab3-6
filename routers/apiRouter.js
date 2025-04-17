const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainControllers.js');

// GET all trains with pagination
router.get('/trains', trainController.getAllTrainsApi);

// GET single train by ID
router.get('/trains/:id', trainController.getTrainByIdApi);

// POST create new train
router.post('/trains', trainController.createTrainApi);

// PUT update train
router.put('/trains/:id', trainController.updateTrainApi);

// DELETE train
router.delete('/trains/:id', trainController.deleteTrainApi);

// GET filtered trains
router.get('/trains/filter', trainController.filterTrainsApi);

module.exports = router; 