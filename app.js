require('dotenv').config();

const debug = require('debug');
const errStream = debug('a-todo:error');
const logStream = debug('a-todo:log');
logStream.log = console.log.bind(console);

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');

const app = express();

app.use(
  logger('dev', { stream: { write: (log) => logStream(log.trimEnd()) } })
);
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
  err.status = err.status || 500;

  if (err.status >= 500)
    errStream('%O', {
      err: `${err.status} ${err.message}`,
      request: {
        startLine: `${req.method} ${req.originalUrl} ${req.protocol}`,
        headers: req.headers,
        body: req.body,
      },
    });

  return res
    .status(err.status)
    .json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
