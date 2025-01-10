var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const nodemailer = require("nodemailer");

var tools = require('./configuration/tools');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var adminRouter = require('./routes/admin');
var managerRouter = require('./routes/manager');

var cron = require('node-cron');

var app = express();

//Session Middleware (persistent auth)
app.use(session({ secret: 'asdfasdf', resave: true, saveUninitialized: true}));

// init passport on every route call.
app.use(passport.initialize());

// allow passport to use "express-session".
app.use(passport.session());

// mysql import
const mysql = require('mysql');

// create a connection pool
var dbConnectionPool = mysql.createPool({
    host:'localhost',
    database:'webPage'
});

// starting email transporter
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'hughmongushearts@gmail.com',
           pass: 'pvsa domw jrez vipo'
       }
   });

// pass the pool to the routes
app.use(function(req, res, next){
    req.pool = dbConnectionPool;
    next();
});

// pass the transporter to the routes
app.use(function(req, res, next){
    req.transporter = transporter;
    next();
});

// cron job to delete expired tokens every 3 days
cron.schedule('0 0 */3 * *', () => {
    dbConnectionPool.query("DELETE FROM resetTokens", function(err, result){
    });

    dbConnectionPool.query("DELETE FROM AdminTokens", function(err, result){
    });
});



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/admin', tools.checkIsAdmin, adminRouter);
app.use('/manager', tools.checkIsManager, managerRouter);


module.exports = app;
