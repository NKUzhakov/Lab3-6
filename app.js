const express = require('express');
const path = require("path")
const bodyParser = require('body-parser');
const trainRoutes = require('./routers/trainsRouter.js');
const adminRoutes = require('./routers/adminRouter.js');

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

app.use('/trains', trainRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.redirect('/trains');
});

app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path);
    }
});

//  
app.listen(port, () => {
    console.log(`Server has been started on adress http://localhost:${port}`);
    
});