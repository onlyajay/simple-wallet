const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connection = require('express-myconnection');
const mysql = require('mysql');

const indexRouter = require('./routes/index');

const app = express();
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', false);
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
};
app.use(connection(mysql,{
    host: "localhost",
    user: "root",
    password: "",
    database: 'wallet_db'
},'request'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(allowCrossDomain);

app.use('/', indexRouter);

module.exports = app;
