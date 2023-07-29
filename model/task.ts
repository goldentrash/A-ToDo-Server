import type { PoolConnection } from "mysql2/promise";

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
  async findAll(conn: PoolConnection, user_id: Task["user_id"]) {
    return await conn.execute(
      `
      SELECT
        *
      FROM
        task
      WHERE
        user_id = ?;
      `,
      [user_id]
    );
  },
  async register(
    conn: PoolConnection,
    {
      id,
      user_id,
      content,
      deadline,
    }: Pick<Task, "id" | "user_id" | "content" | "deadline">
  ) {
    return await conn.execute(
      `
      INSERT INTO
        task (id, user_id, content, deadline)
      VALUES
        (?, ?, ?, ?);
      `,
      [id, user_id, content, deadline]
    );
  },
  async start(conn: PoolConnection, id: Task["id"]) {
    return await conn.execute(
      `
      UPDATE task
      SET
        progress = doing,
        started_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `,
      [id]
    );
  },
  async finish(conn: PoolConnection, id: Task["id"]) {
    return await conn.execute(
      `
      UPDATE task
      SET
        progress = done,
        finished_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `,
      [id]
    );
  },
};
