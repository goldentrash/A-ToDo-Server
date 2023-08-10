import debug from "debug";
import createError, { HttpError } from "http-errors";
import logger from "morgan";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { usersRouter, tasksRouter } from "router";

const errStream = debug("a-todo:error");
const logStream = debug("a-todo:log");
logStream.log = console.log.bind(console);

const app = express();

app.use(
  logger("dev", {
    stream: { write: (log: string) => logStream(log.trimEnd()) },
  })
);
app.use(express.json());

app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);

// catch 404 and forward to error handler
app.use((_req, _res, next: NextFunction) => {
  return next(createError(404, "Not Found"));
});

// error handler
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let status: number;
  let message: string;

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else {
    status = 500;
    message = "Internal Server Error";
  }

  errStream("%O", {
    err: `${status} ${message}`,
    ...(status >= 500 && { errDetail: err }),
    request: {
      startLine: `${req.method} ${req.originalUrl} ${req.protocol}`,
      headers: req.headers,
      body: req.body,
    },
  });

  return res.status(status).json({ error: message });
});

export = app;
