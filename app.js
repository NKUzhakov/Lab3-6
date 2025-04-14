const express = require('express');
const path = require("path")
const bodyParser = require('body-parser');
const trainRoutes = require('./routers/trainsRouter.js');
const adminRoutes = require('./routers/adminRouter.js');
const apiRoutes = require('./routers/apiRouter.js');

const port = 3005;
// const config = {
//     server: "WIN-SNV0NG9VUDN",
//     database: "trainSys",
//     options: {
//       trustedConnection: true,
//       trustServerCertificate: true, 
//     },
//     driver: "msnodesqlv8"
// };
const app = express();

app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/trains', trainRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.redirect('/trains');
});

app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

//  
app.listen(port, () => {
    console.log(`Server has been started on adress http://localhost:${port}`);
    
});