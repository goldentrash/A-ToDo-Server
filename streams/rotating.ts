import path from "path";
import * as rfs from "rotating-file-stream";
import { LOG_ROTATION_INTERVAL } from "../constants";

const makeFilePrefix = (date: Parameters<rfs.Generator>[0]) =>
  date instanceof Date
    ? `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
    : "writing";

const rotatingOption = {
  interval: LOG_ROTATION_INTERVAL,
  path: path.join(__dirname, "..", "logs"),
};

export const errorStream = rfs.createStream(
  (date) => `${makeFilePrefix(date)}-error.log`,
  rotatingOption
);

export const accessStream = rfs.createStream(
  (date) => `${makeFilePrefix(date)}-access.log`,
  rotatingOption
);

export const infoStream = rfs.createStream(
  (date) => `${makeFilePrefix(date)}-info.log`,
  rotatingOption
);

export const rotatingStream = {
  logAccess(access: string) {
    accessStream.write(`[${new Date().toISOString()}] ${access}\n`);
  },
  logError(error: string) {
    errorStream.write(`[${new Date().toISOString()}] ${error}\n`);
  },
  logInfo(info: string) {
    infoStream.write(`[${new Date().toISOString()}] ${info}\n`);
  },
};

errorStream.on("rotated", (fileName) =>
  rotatingStream.logInfo(`${fileName} has been flushed`)
);

accessStream.on("rotated", (fileName) =>
  rotatingStream.logInfo(`${fileName} has been flushed`)
);

infoStream.on("rotated", (fileName) =>
  rotatingStream.logInfo(`${fileName} has been flushed`)
);
