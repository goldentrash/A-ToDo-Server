import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "a_todo",
});

export { userModel } from "./user";
export type { User } from "./user";
export { taskModel } from "./task";
export type { Task, Todo, Doing, Done } from "./task";
