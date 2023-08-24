import Knex from "knex";

export const knex = Knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: parseInt(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_USER
      ? process.env.DB_PASSWORD
      : process.env.DB_ROOT_PASSWORD,
    database: "a_todo",
    dateStrings: true,
  },
  pool: { min: 0, max: 7 },
});

export { userRepo } from "./user";
export { taskRepo } from "./task";
