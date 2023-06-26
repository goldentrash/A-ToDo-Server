require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');

const app = express();

app.use(logger(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));
app.use(express.json());

app.use('/todos', require('./routes/todo'));
app.use('/doings', require('./routes/doing'));
app.use('/dones', require('./routes/done'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return next(createError(404, 'Not Found'));
});

// error handler
app.use(function (err, req, res, next) {
  return res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
