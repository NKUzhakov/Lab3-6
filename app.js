const express = require('express');
const path = require("path")
const bodyParser = require('body-parser');
const adminRoutes = require('./routers/adminRouter.js');
const apiRoutes = require('./routers/apiRouter.js');

const port = 3005;
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.redirect('/api/trains');
});

app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path);
    }
});

app.listen(port, () => {
    console.log(`Server has been started on adress http://localhost:${port}`);    
});