import "dotenv/config";
import debug from "debug";
import createError, { HttpError } from "http-errors";
import logger from "morgan";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { genUsersRouter, genTasksRouter } from "./router";
import { genUserService, genTaskService } from "./service";
import { userRepo, taskRepo } from "./repository";

const app = express();

const errStream = debug("a-todo:error");
const logStream = debug("a-todo:log");
logStream.log = console.log.bind(console);
const detailedLogStream = debug("a-todo:log:detailed");
detailedLogStream.log = console.log.bind(console);

app.use(
  logger("dev", {
    stream: { write: (log: string) => logStream(log.trimEnd()) },
  })
);
app.use(express.json());

// inject dependencies
const userService = genUserService(userRepo);
const taskService = genTaskService(taskRepo);
const usersRouter = genUsersRouter(userService);
const tasksRouter = genTasksRouter(taskService, userService);

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

  if (status >= 500)
    errStream("%o", {
      err: `${status} ${message}`,
      errDetail: err,
      request: {
        startLine: `${req.protocol} ${req.method} ${req.originalUrl}`,
        headers: req.headers,
        body: req.body,
      },
    });
  else
    detailedLogStream("%o", {
      err: `${status} ${message}`,
      request: {
        startLine: `${req.protocol} ${req.method} ${req.originalUrl}`,
        headers: req.headers,
        body: req.body,
      },
    });

  return res.status(status).json({ error: message });
});

const port = parseInt(process.env.PORT ?? "3000");
app.listen(port, () => {
  logStream("%s", `Server listening on port ${port}`);
});
