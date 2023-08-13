import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_USER
    ? process.env.DB_PASSWORD
    : process.env.DB_ROOT_PASSWORD,
  database: "a_todo",
  dateStrings: true,
});

export { default as userModel, userDAO, type User, type UserDAO } from "./user";
export {
  taskDAO,
  type Task,
  type Todo,
  type Doing,
  type Done,
  type TaskDAO,
} from "./task";
