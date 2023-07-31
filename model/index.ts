import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "a_todo",
  dateStrings: true,
});

export { userModel, type User } from "./user";
export { taskModel, type Task, type Todo, type Doing, type Done } from "./task";
