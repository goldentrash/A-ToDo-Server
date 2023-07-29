import type {
  ResultSetHeader,
  PoolConnection,
  RowDataPacket,
} from "mysql2/promise";

export type User = {
  id: string;
  hashed_password: string;
  registerd_at: string;
  last_accessed_at: string;
};

export const userModel = {
  async find(conn: PoolConnection, id: User["id"]) {
    return await conn.execute<RowDataPacket[]>(
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
    return await conn.execute<ResultSetHeader>(
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
    { id, hashed_password }: Pick<User, "id" | "hashed_password">
  ) {
    return await conn.execute<ResultSetHeader>(
      `
        INSERT INTO
          user (id, hashed_password)
        VALUES
          (?, ?);
        `,
      [id, hashed_password]
    );
  },
};
