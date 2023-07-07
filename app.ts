import debug from 'debug';
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import todoRouter from 'routes/todo';
import doingRouter from 'routes/doing';
import doneRouter from 'routes/done';
import { HttpError } from 'http-errors';
import type { Request, Response, NextFunction } from 'express';

const errStream = debug('a-todo:error');
const logStream = debug('a-todo:log');
logStream.log = console.log.bind(console);

const app = express();

app.use(
  logger('dev', {
    stream: { write: (log: string) => logStream(log.trimEnd()) },
  })
);
app.use(express.json());

app.use('/todos', todoRouter);
app.use('/doings', doingRouter);
app.use('/dones', doneRouter);

// catch 404 and forward to error handler
app.use((_req, _res, next: NextFunction) => {
  return next(createError(404, 'Not Found'));
});

// error handler
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let status: number;
  let message: string;

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof Error) {
    status = 500;
    message = err.message;
  } else {
    status = 500;
    message = 'Internal Server Error';
  }

  if (status >= 500)
    errStream('%O', {
      err: `${status} ${message}`,
      request: {
        startLine: `${req.method} ${req.originalUrl} ${req.protocol}`,
        headers: req.headers,
        body: req.body,
      },
    });

  return res.status(status).json({ message });
});

export = app;
