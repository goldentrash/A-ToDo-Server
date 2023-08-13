import {
  type ResultSetHeader,
  type PoolConnection,
  type RowDataPacket,
  type QueryError,
} from "mysql2/promise";
import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export type User = {
  id: string;
  hashed_password: string;
  registerd_at: string;
  last_accessed_at: string;
};

export default {
  checkPassword: async (user: User, password: string) => {
    const ret = await bcrypt.compare(password, user.hashed_password);
    if (!ret) throw createError(400, "Password Invalid");
  },
  hashPassword: (password: string) => bcrypt.hash(password, 5),
  makeToken: (user: User) =>
    jwt.sign(
      { userId: user.id },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.JWT_SECRET!,
      { expiresIn: "1 days" }
    ),
};

export type UserDAO = typeof userDAO;

export const userDAO = {
  find(conn: PoolConnection, id: User["id"]) {
    const sql = `
      SELECT
        id,
        hashed_password,
        registerd_at,
        last_accessed_at
      FROM
        user
      WHERE
        id = ?;
      `;

    return new Promise<User>((resolve, reject) => {
      conn.execute<RowDataPacket[]>(sql, [id]).then(([[user]]) => {
        if (!user) return reject(createError(400, "User Absent"));

        return resolve(user as User);
      });
    });
  },
  updateAccessTime(conn: PoolConnection, id: User["id"]) {
    const sql = `
      UPDATE user
      SET
        last_accessed_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
      `;

    return new Promise<void>((resolve, _reject) => {
      conn.execute<ResultSetHeader>(sql, [id]).then(() => resolve());
    });
  },
  register(
    conn: PoolConnection,
    { id, hashed_password }: Pick<User, "id" | "hashed_password">
  ) {
    const sql = `
      INSERT INTO
        user (id, hashed_password)
      VALUES
        (?, ?);
      `;

    return new Promise<void>((resolve, reject) => {
      conn
        .execute<ResultSetHeader>(sql, [id, hashed_password])
        .then(() => resolve())
        .catch((err: QueryError) => {
          if (err.code === "ER_DUP_ENTRY")
            return reject(createError(400, "User ID Duplicated"));

          if (err.code === "ER_DATA_TOO_LONG")
            return reject(createError(400, "User ID Too Long"));

          return reject(err);
        });
    });
  },
};
