import path from "path";
import * as rfs from "rotating-file-stream";
import { LOG_ROTATION_INTERVAL } from "../constants";
import { date2string } from "./helper";

export const errStream = rfs.createStream(
  (time) => {
    if (!(time instanceof Date)) time = new Date();
    return `error-${date2string(time)}.log`;
  },
  {
    interval: LOG_ROTATION_INTERVAL,
    path: path.join(__dirname, "..", "logs"),
  }
);

export const accessStream = rfs.createStream(
  (time) => {
    if (!(time instanceof Date)) time = new Date();
    return `access-${date2string(time)}.log`;
  },
  {
    interval: LOG_ROTATION_INTERVAL,
    path: path.join(__dirname, "..", "logs"),
  }
);

export const logStream = rfs.createStream(
  (time) => {
    if (!(time instanceof Date)) time = new Date();
    return `log-${date2string(time)}.log`;
  },
  {
    interval: LOG_ROTATION_INTERVAL,
    path: path.join(__dirname, "..", "logs"),
  }
);
