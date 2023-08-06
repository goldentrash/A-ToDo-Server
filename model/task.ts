import type {
  ResultSetHeader,
  PoolConnection,
  RowDataPacket,
} from "mysql2/promise";

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

export const taskModel = {
  async findByUser(conn: PoolConnection, user_id: Task["user_id"]) {
    return await conn.execute<RowDataPacket[]>(
      `
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
      `,
      [user_id]
    );
  },
  async find(conn: PoolConnection, id: Task["id"]) {
    return await conn.execute<RowDataPacket[]>(
      `
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
      `,
      [id]
    );
  },
  async register(
    conn: PoolConnection,
    {
      user_id,
      content,
      deadline,
    }: Pick<Task, "user_id" | "content" | "deadline">
  ) {
    return await conn.execute<ResultSetHeader>(
      `
      INSERT INTO
        task (user_id, content, deadline)
      VALUES
        (?, ?, ?);
      `,
      [user_id, content, deadline]
    );
  },
  async start(conn: PoolConnection, id: Task["id"]) {
    return await conn.execute<ResultSetHeader>(
      `
      UPDATE task
      SET
        progress = "doing",
        started_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `,
      [id]
    );
  },
  async finish(conn: PoolConnection, id: Task["id"]) {
    return await conn.execute<ResultSetHeader>(
      `
      UPDATE task
      SET
        progress = "done",
        finished_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `,
      [id]
    );
  },
  async setMemo(conn: PoolConnection, id: Task["id"], memo: Task["memo"]) {
    return await conn.execute<ResultSetHeader>(
      `
      UPDATE task
      SET
        memo = ?
      WHERE
        id = ?;
      `,
      [memo, id]
    );
  },
};
