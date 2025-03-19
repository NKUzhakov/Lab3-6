const express = require('express');
const router = express.Router();
const Train = require('../models/Train'); 

router.get('/', (req, res) => {
    const trains = Train.getAll(data=>{
        res.render('admin', { trains: data});
    });
    
});

router.post('/add', (req, res) => {
    const { name, from, to, time } = req.body;
    if (!name || !from || !to || !time) {
        console.error("ПОМИЛКА: Усі поля повинні бути заповнені!");
        return res.status(400).send("Усі поля повинні бути заповнені!");
    }
    Train.addTrain({ name, from, to, time }).then(()=>{res.redirect('/admin');})
                                            .catch((err)=>{
                                                return res.status(400).send(err);
                                            });
    
});


router.post('/delete/', (req, res) => {
    console.log("🗑 Отримано запит на видалення потяга, ID:", req.body.id);

    if (!req.body.id) {
        console.error("❌ ПОМИЛКА: ID не передано!");
        return res.status(400).send("<h1>❌ ПОМИЛКА: ID потяга не вказано!</h1>");
    }

    const success = Train.deleteTrain(req.body.id);
    if (!success) {
        console.error("❌ ПОМИЛКА: Потяг з таким ID не знайдено!");
        return res.status(400).send("<h1>❌ ПОМИЛКА: Потяг не знайдено!</h1>");
    }

    console.log("✅ Потяг успішно видалено!");
    res.redirect('/admin');  // 🔥 ПРАВИЛЬНЕ ПЕРЕНАПРАВЛЕННЯ
});
router.post('/updateform',(req, res) => {
    Train.getById(req.body.id, train=>{
        res.render('admin_update', { train });
    })
});
router.post('/update/',(req, res) => {
    const train = req.body;
    const {id, name, from, to, time } = train
    if (!name || !from || !to || !time) {
        console.error("ПОМИЛКА: Усі поля повинні бути заповнені!");
        return res.status(400).send("Усі поля повинні бути заповнені!");
    }
    
    
    Train.updateTrain(id, { name, from, to, time }).then(()=>{res.redirect('/admin');})
    .catch((err)=>{
        return res.status(400).send(err);
    });

}) 
module.exports = router;
