import type { PoolConnection } from "mysql2/promise";

type User = {
  id: string;
  salt: string;
  hashedPassword: string;
  registerdAt: string;
  lastAccessedAt: string;
};

export const user = {
  async find(conn: PoolConnection, id: User["id"]) {
    return await conn.execute(
      `
      SELECT
        *
      FROM
        user
      WHERE
        id = ?;
      `,
      [id]
    );
  },
  async updateAccessTime(conn: PoolConnection, id: User["id"]) {
    return await conn.execute(
      `
      UPDATE user
      SET
        last_accessed_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `,
      [id]
    );
  },
  async register(
    conn: PoolConnection,
    { id, salt, hashedPassword }: Pick<User, "id" | "salt" | "hashedPassword">
  ) {
    return await conn.execute(
      `
      INSERT INTO
        user (id, salt, hashed_password)
      VALUES
        (?, ?, ?);
      `,
      [[id, salt, hashedPassword]]
    );
  },
};
