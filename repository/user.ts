import { type QueryError } from "mysql2/promise";
import createError from "http-errors";
import { type Knex } from "knex";
import { type UserDAO, type UserDTO } from "service";

export const userRepo: UserDAO = {
  findById(knex: Knex, id: UserDTO["id"]) {
    const query = knex("user").where("id", id).first();

    return new Promise<UserDTO>((resolve, reject) => {
      query.then((user) => {
        if (!user) return reject(createError(400, "User Absent"));

        return resolve({
          id: user.id,
          hashed_password: user.hashed_password,
          last_accessed_at: user.last_accessed_at,
        });
      });
    });
  },

  updateAccessTime(knex: Knex, id: UserDTO["id"]) {
    const query = knex("user")
      .where("id", id)
      .update("last_accessed_at", knex.fn.now());

    return new Promise<void>((resolve, _reject) => {
      query.then(() => resolve());
    });
  },

  insert(knex: Knex, { id, hashed_password }: UserDTO) {
    const query = knex("user").insert({ id, hashed_password });

    return new Promise<void>((resolve, reject) => {
      query
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
