const Train = require('../models/Train.js');

// REST API endpoints
exports.getAllTrainsApi = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    Train.getAll((trains) => {
        res.render('index', {trains});
    }, page, limit);
};

exports.getTrainByIdApi = (req, res) => {
    const id = req.query.id;
    Train.getById(id, (train) => {
        if (!train) {
            return res.status(404).json({
                status: 'error',
                message: 'Train not found'
            });
        }

        res.render('admin_update', { train });
    });
};
exports.createTrainApi = (req, res) => {
    const trainData = req.body;
    if (!trainData.name || !trainData.from || !trainData.to || !trainData.time) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }

    Train.addTrain(trainData).then(() => res.status(200).redirect('/admin/'))
    .catch((err) => res.status(500).json({
        status: 'error',
        message: err.message
    }))
};
exports.updateTrainApi = (req, res) => {
    const trainData = req.body;
    const { id, name, from, to, time} = trainData
    if (!name || !from || !to || !time) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }

    Train.updateTrain(id, trainData).then(() => {
        res.status(200).redirect('/admin/')
    }).catch((err) => res.status(500).json({
        status: 'error',
        message: err.message
    }));
};
exports.deleteTrainApi = (req, res) => {
    const id = req.body.id;
    Train.deleteTrain(id).then(() => {
        res.status(200).redirect('/admin/')
    }).catch((err) => res.status(500).json({
        status: 'error',
        message: err.message
    }));
};

exports.filterTrainsApi = (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }
    
    Train.search(from, to, (trains) => {
        res.render('search', { results: trains, from, to });
    });
};
