const Train = require('../models/Train.js');

exports.getAdminPanel = (req, res) => {
     Train.getAll(data=>{
        res.render('admin', { trains:data });
    })
    
};

exports.addTrain = (req, res) => {
    const { name, from, to, departure, arrival } = req.body;

    if (!name || !from || !to || !departure || !arrival) {
        return res.redirect('/admin?error=missing_fields');
    }

    Train.addTrain({ name, from, to, departure, arrival });
    res.redirect('/admin'); 
};

exports.deleteTrain = (req, res) => {
    const { id } = req.params;
    Train.deleteTrain(id);
    res.redirect('/admin');
};
