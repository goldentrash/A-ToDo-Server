import "dotenv/config";
import createError, { HttpError } from "http-errors";
import morgan from "morgan";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { genUsersRouter, genTasksRouter } from "./routes";
import { genUserService, genTaskService } from "./services";
import { userRepo, taskRepo } from "./repositories";
import { accessStream, rotatingStream } from "./streams";
import { NODE_ENV, PORT } from "./constants";
import "./schedules";

const app = express();
app.use(express.json());
app.use(
  NODE_ENV === "production"
    ? morgan(
        `[:date[iso]] "HTTP/:http-version :method :url" :status (:res[content-length] ms) - ":user-agent"`,
        { stream: accessStream }
      )
    : morgan("dev")
);

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

  rotatingStream.logError(
    JSON.stringify({
      err: `${status} ${message}`,
      errDetail: status < 500 ? undefined : err,
      request: {
        startLine: `${req.protocol} ${req.method} ${req.originalUrl}`,
        headers: req.headers,
        body: req.body,
      },
    })
  );

  return res.status(status).json({ error: message });
});

app.listen(PORT, () =>
  rotatingStream.logInfo(`Server listening on port ${PORT}`)
);
