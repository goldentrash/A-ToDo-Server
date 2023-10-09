import Knex from "knex";
import { DB_POOL_MAX, DB_POOL_MIN } from "../constants";

export const knex = Knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_USER
      ? process.env.DB_PASSWORD
      : process.env.DB_ROOT_PASSWORD,
    database: "a_todo",
    dateStrings: true,
  },
  pool: {
    min: DB_POOL_MIN,
    max: DB_POOL_MAX,
  },
});

export { userRepo } from "./user";
export { taskRepo } from "./task";
