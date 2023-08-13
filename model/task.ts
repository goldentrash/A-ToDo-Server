import {
  type ResultSetHeader,
  type PoolConnection,
  type RowDataPacket,
  type QueryError,
} from "mysql2/promise";
import createError from "http-errors";

type TaskBase = {
  id: string;
  user_id: string;
  content: string;
  memo: string;
  deadline: string;
  registerd_at: string;
};
export type Todo = TaskBase & { progress: "todo" };
export type Doing = TaskBase & { progress: "doing"; started_at: string };
export type Done = TaskBase & {
  progress: "done";
  started_at: string;
  finished_at: string;
};
export type Task = Todo | Doing | Done;

export type TaskDAO = typeof taskDAO;

export const taskDAO = {
  findByUser(conn: PoolConnection, user_id: Task["user_id"]) {
    const sql = `
      SELECT
        id,
        progress,
        user_id,
        content,
        memo,
        deadline,
        registerd_at,
        started_at,
        finished_at
      FROM
        task
      WHERE
        user_id = ?;
      `;

    return new Promise<Task[]>((resolve, _reject) => {
      conn.execute<RowDataPacket[]>(sql, [user_id]).then(([taskArr]) => {
        return resolve(taskArr as Task[]);
      });
    });
  },
  find(conn: PoolConnection, id: Task["id"]) {
    const sql = `
      SELECT
        id,
        progress,
        user_id,
        content,
        memo,
        deadline,
        registerd_at,
        started_at,
        finished_at
      FROM
        task
      WHERE
        id = ?;
      `;

    return new Promise<Task>((resolve, reject) => {
      conn.execute<RowDataPacket[]>(sql, [id]).then(([[task]]) => {
        if (!task) return reject(createError(400, "Task Absent"));

        return resolve(task as Task);
      });
    });
  },
  register(
    conn: PoolConnection,
    {
      user_id,
      content,
      deadline,
    }: Pick<Task, "user_id" | "content" | "deadline">
  ) {
    const sql = `
      INSERT INTO
        task (user_id, content, deadline)
      VALUES
        (?, ?, ?);
      `;

    return new Promise<string>((resolve, reject) => {
      conn
        .execute<ResultSetHeader>(sql, [user_id, content, deadline])
        .then(([{ insertId }]) => {
          return resolve(insertId.toString());
        })
        .catch((err: QueryError) => {
          if (err.code === "ER_TRUNCATED_WRONG_VALUE")
            return reject(createError(400, "Property Invalid"));

          if (err.code === "ER_DATA_TOO_LONG")
            return reject(createError(400, "Content Too Long"));

          return reject(err);
        });
    });
  },
  start(conn: PoolConnection, id: Task["id"]) {
    const sql = `
      UPDATE task
      SET
        progress = "doing",
        started_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `;

    return new Promise<void>((resolve, reject) => {
      conn
        .execute<ResultSetHeader>(sql, [id])
        .then(() => resolve())
        .catch((err: QueryError) => {
          if (err.code === "ER_DUP_ENTRY")
            return reject(createError(400, "User Busy"));

          if (err.code === "ER_TRUNCATED_WRONG_VALUE")
            return reject(createError(400, "Task ID Invalid"));

          return reject(err);
        });
    });
  },
  finish(conn: PoolConnection, id: Task["id"]) {
    const sql = `
      UPDATE task
      SET
        progress = "done",
        finished_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `;

    return new Promise<void>((resolve, reject) => {
      conn
        .execute<ResultSetHeader>(sql, [id])
        .then(() => resolve())
        .catch((err: QueryError) => {
          if (err.code === "ER_CHECK_CONSTRAINT_VIOLATED")
            return reject(createError(400, "Task Unstarted"));

          if (err.code === "ER_TRUNCATED_WRONG_VALUE")
            return reject(createError(400, "Task ID Invalid"));

          return reject(err);
        });
    });
  },
  setMemo(conn: PoolConnection, id: Task["id"], memo: Task["memo"]) {
    const sql = `
      UPDATE task
      SET
        memo = ?
      WHERE
        id = ?;
      `;

    return new Promise<void>((resolve, reject) => {
      conn
        .execute<ResultSetHeader>(sql, [memo, id])
        .then(() => resolve())
        .catch((err: QueryError) => {
          if (err.code === "ER_DATA_TOO_LONG")
            return reject(createError(400, "Property Too Long"));

          if (err.code === "ER_TRUNCATED_WRONG_VALUE")
            return reject(createError(400, "Task ID Invalid"));

          return reject(err);
        });
    });
  },
};
