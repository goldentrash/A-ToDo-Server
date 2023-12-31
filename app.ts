import "dotenv/config";
import createError, { HttpError } from "http-errors";
import morgan from "morgan";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { scheduleJob } from "node-schedule";
import { usersRouter, tasksRouter } from "./routes";
import { accessStream, rotatingStream } from "./streams";
import {
  NODE_ENV,
  PORT,
  SCHEDULE_PUSH_OLD_WORKING_HINT,
  SCHEDULE_PUSH_WATING_ALARM,
} from "./constants";
import { pushOldWorkingHint, pushWatingAlarm } from "./schedules";

// schedule jobs
rotatingStream.logInfo(
  `Schedule pushOldWorkingHint at every ${JSON.stringify(
    SCHEDULE_PUSH_OLD_WORKING_HINT
  )}`
);
scheduleJob(SCHEDULE_PUSH_OLD_WORKING_HINT, pushOldWorkingHint);

rotatingStream.logInfo(
  `Schedule pushWatingAlarm at every ${JSON.stringify(
    SCHEDULE_PUSH_WATING_ALARM
  )}`
);
scheduleJob(SCHEDULE_PUSH_WATING_ALARM, pushWatingAlarm);

// start HTTP server
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
