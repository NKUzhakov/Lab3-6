const Train = require('../models/Train.js');

exports.getAdminPanel = (req, res) => {       
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    Train.getAll((trains) => {
        res.render('admin', {trains, currentPage: page});
    }, page, limit);       
};
exports.getSearchPanel = (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        return res.render('search', { results: [], from, to });
    }

    Train.search(from, to, data => {
        res.render('search', { results: data, from, to }); 
    });
};
