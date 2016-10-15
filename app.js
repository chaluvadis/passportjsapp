var express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    flash = require('connect-flash'),
    session = require('express-session'),
    passport = require('passport'),
    mongoose = require('mongoose');

// mongodb connection    
mongoose.connect('mongodb://localhost/passportapp');
var db = mongoose.connection;

var index = require('./routes/index'),
    users = require('./routes/users');

//init the application
var app = express();

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body parser middle ware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

//public static files
app.use(express.static(path.join(__dirname, 'public')));

//session config
app.use(session({
    secret: 'passport js',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

// In this example, the formParam value is going to get morphed into form body format useful for printing. 
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// connect flash
app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//register the routes
app.use('/', index);
app.use('/users', users);

app.set('PORT', (process.env.PORT || 1337));

app.listen(app.get('PORT'), function () {
    console.log('Server is running on port ' + app.get('PORT'));
});