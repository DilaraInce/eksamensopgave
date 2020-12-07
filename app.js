const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var hbs = require('express-handlebars');
const userRoutes = require('./Controller/UserController');

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '(views(layouts/'}));
app.set ('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

mongoose.connect(
    'mongodb+srv://DilaraInce:K45740103b@cluster0.zcld8.mongodb.net/Cluster0?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
);
mongoose.Promise = global.Promise

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Acsess-Control-Allow-Origin', '*');
    res.header('Acsess-Control-Allow-Header', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

next();
});

app.use("/user", userRoutes);

app.use((req, res, next) => {
    const error = new Error(')Not found');
    error.status = 404;
    next(error);
})

app.use((error, rew, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

app.use((req, res, next) => {
    res.status(200).json({
        message: 'It works! lol'
    });
});

module.exports = app;

