import {
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
  type QueryError,
} from "mysql2/promise";
import createError from "http-errors";
import { type TaskDAO, type TaskDTO, type SearchOption } from "service";

type TaskEntity = {
  id: string;
  user_id: string;
  progress: "todo" | "doing" | "done";
  content: string;
  memo: string;
  deadline: string;
  registerd_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export const taskRepo: TaskDAO = {
  find(conn: PoolConnection, id: TaskDTO["id"]) {
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

    return new Promise<TaskDTO>((resolve, reject) => {
      conn.execute<RowDataPacket[]>(sql, [id]).then(([[taskEntity]]) => {
        if (!taskEntity) return reject(createError(400, "Task Absent"));

        const { id, user_id, progress, content, memo, deadline }: TaskDTO =
          taskEntity as TaskEntity;
        return resolve({ id, user_id, progress, content, memo, deadline });
      });
    });
  },
  findByUser(
    conn: PoolConnection,
    user_id: TaskDTO["user_id"],
    { sort, filter: { progress } }: SearchOption
  ) {
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
        user_id = ?
        ${
          progress
            ? `AND progress IN (${"?"
                .repeat(progress.length)
                .split("")
                .join(", ")})`
            : ``
        }
      ORDER BY 
        ${sort ? conn.escapeId(sort) : "NULL"};
      `;

    return new Promise<TaskDTO[]>((resolve, _reject) => {
      conn
        .execute<RowDataPacket[]>(sql, [user_id, ...(progress ?? [])])
        .then(([taskEntityArr]) => {
          const taskDTOs: TaskDTO[] = taskEntityArr.map((taskEntity) => {
            const { id, user_id, progress, content, memo, deadline }: TaskDTO =
              taskEntity as TaskEntity;

            return { id, user_id, progress, content, memo, deadline };
          });

          return resolve(taskDTOs);
        });
    });
  },
  register(
    conn: PoolConnection,
    {
      user_id,
      content,
      deadline,
    }: Pick<TaskDTO, "user_id" | "content" | "deadline">
  ) {
    const sql = `
      INSERT INTO
        task (user_id, content, deadline)
      VALUES
        (?, ?, ?);
      `;

    return new Promise<TaskDTO["id"]>((resolve, reject) => {
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
  start(conn: PoolConnection, { id }: TaskDTO) {
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
  finish(conn: PoolConnection, { id }: TaskDTO) {
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
  setMemo(conn: PoolConnection, { id, memo }: TaskDTO) {
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
