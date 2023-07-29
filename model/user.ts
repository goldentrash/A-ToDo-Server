import type {
  ResultSetHeader,
  PoolConnection,
  RowDataPacket,
  QueryError,
} from "mysql2/promise";
import createError from "http-errors";

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
    { id, hashed_password }: Pick<User, "id" | "hashed_password">
  ) {
    return await conn
      .execute<ResultSetHeader>(
        `
        INSERT INTO
          user (id, hashed_password)
        VALUES
          (?, ?);
        `,
        [id, hashed_password]
      )
      .catch((err: QueryError) => {
        if (err.code === "ER_DUP_ENTRY")
          throw createError(400, "duplicated user ID");

        if (err.code === "ER_DATA_TOO_LONG")
          throw createError(400, "too long user ID");

        throw createError(500, "database error");
      });
  },
};
