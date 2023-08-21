import {
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
  type QueryError,
} from "mysql2/promise";
import createError from "http-errors";
import { type UserDAO, type UserDTO } from "service";

type UserEntity = {
  id: string;
  hashed_password: string;
  registerd_at: string;
  last_accessed_at: string;
};

export const userRepo: UserDAO = {
  find(conn: PoolConnection, id: UserDTO["id"]) {
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

    return new Promise<UserDTO>((resolve, reject) => {
      conn.execute<RowDataPacket[]>(sql, [id]).then(([[userEntity]]) => {
        if (!userEntity) return reject(createError(400, "User Absent"));

        const { id, hashed_password }: UserDTO = userEntity as UserEntity;
        return resolve({ id, hashed_password });
      });
    });
  },
  updateAccessTime(conn: PoolConnection, id: UserDTO["id"]) {
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
  register(conn: PoolConnection, { id, hashed_password }: UserDTO) {
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
