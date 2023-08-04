import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_USER
    ? process.env.DB_PASSWORD
    : process.env.DB_ROOT_PASSWORD,
  database: "a_todo",
  dateStrings: true,
});

export { userModel, type User } from "./user";
export { taskModel, type Task, type Todo, type Doing, type Done } from "./task";
