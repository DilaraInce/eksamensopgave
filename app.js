const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')
const cookieParser = require('cookie-parser');

const matchController = require('./Controller/MatchController');
const userController = require('./Controller/UserController');

mongoose.connect(
    'mongodb+srv://DilaraInce:K45740103b@cluster0.zcld8.mongodb.net/Cluster0?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

app.engine('html', hbs({extname: 'html', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set ('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.use("/", matchController);
app.use("/user", userController);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;