import type { PoolConnection } from "mysql2/promise";

type TaskBase = {
  id: string;
  userId: string;
  content: string;
  memo: string;
  deadline: string;
  daysUntilDeadline: string;
  registerdAt: string;
};
type Todo = TaskBase & { progress: "todo" };
type Doing = TaskBase & { progress: "doing"; startedAt: string };
type Done = TaskBase & {
  progress: "done";
  startedAt: string;
  finishedAt: string;
};
type Task = Todo | Doing | Done;

export const task = {
  async findAll(conn: PoolConnection, userId: Task["userId"]) {
    return await conn.execute(
      `
      SELECT
        *
      FROM
        task
      WHERE
        user_id = ?;
      `,
      [userId]
    );
  },
  async register(
    conn: PoolConnection,
    {
      id,
      userId,
      content,
      deadline,
    }: Pick<Task, "id" | "userId" | "content" | "deadline">
  ) {
    return await conn.execute(
      `
      INSERT INTO
        task (id, user_id, content, deadline)
      VALUES
        (?, ?, ?, ?);
      `,
      [[id, userId, content, deadline]]
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
