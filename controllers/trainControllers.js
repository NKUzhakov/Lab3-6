const Train = require('../models/Train.js'); 

exports.searchTrains = (req, res) => {
    const { from, to } = req.query;
    console.log("📢 Викликано пошук потягів:", from, to);

    if (!from || !to) {
        return res.render('search', { results: [], from, to });
    }

    const results = Train.search(from, to, data=>{
        // console.log(data);
        
        res.render('search', { results:data, from, to }); 
    });
    
};

exports.getAllTrains = (req, res) => {
    const trains = Train.getAll(data=>{
        res.render('index', { trains:data });
    }); 
    // res.render('trains/index', { trains });
};