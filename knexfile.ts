import "dotenv/config";
import { type Knex } from "knex";
import {
  DB_POOL_MAX,
  DB_POOL_MIN,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "./constants";

const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    dateStrings: true,
  },
  pool: {
    min: DB_POOL_MIN,
    max: DB_POOL_MAX,
  },
};

export = config;
