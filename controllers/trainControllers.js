const Train = require('../models/Train.js');

// REST API endpoints
exports.getAllTrainsApi = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    Train.getAll((trains) => {
        res.status(200).json({
            status: 'success',
            data: trains,
            page,
            limit
        });
    }, page, limit);
};

exports.getTrainByIdApi = (req, res) => {
    const id = req.params.id;
    Train.getById(id, (train) => {
        if (!train) {
            return res.status(404).json({
                status: 'error',
                message: 'Train not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: train
        });
    });
};

exports.createTrainApi = (req, res) => {
    const trainData = req.body;
    if (!trainData.train_number || !trainData.departure_station || !trainData.arrival_station) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }

    Train.create(trainData, (newTrainId) => {
        if (!newTrainId) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to create train'
            });
        }
        res.status(201).json({
            status: 'success',
            data: { id: newTrainId }
        });
    });
};

exports.updateTrainApi = (req, res) => {
    const id = req.params.id;
    const trainData = req.body;

    Train.update(id, trainData, (success) => {
        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'Train not found or update failed'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Train updated successfully'
        });
    });
};

exports.deleteTrainApi = (req, res) => {
    const id = req.params.id;
    Train.delete(id, (success) => {
        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'Train not found or delete failed'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Train deleted successfully'
        });
    });
};

exports.filterTrainsApi = (req, res) => {
    const filterParams = req.query;
    Train.filter(filterParams, (trains) => {
        res.status(200).json({
            status: 'success',
            data: trains
        });
    });
};

// Web interface endpoints
exports.getAllTrains = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    Train.getAll(data => {
        res.render('index', { 
            trains: data,
            currentPage: page,
            limit: limit
        });
    }, page, limit);
};

exports.searchTrains = (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        return res.render('search', { results: [], from, to });
    }

    Train.search(from, to, data => {
        res.render('search', { results: data, from, to }); 
    });
};