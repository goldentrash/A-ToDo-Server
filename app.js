require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');

const todoRouter = require('./routes/todo');

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/todos', todoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  return res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
