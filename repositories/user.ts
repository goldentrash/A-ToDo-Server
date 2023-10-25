import { type QueryError } from "mysql2/promise";
import createError from "http-errors";
import { type UserDAO, type UserDTO } from "../services";

export const userRepo: UserDAO = {
  findById(knex, id) {
    const query = knex("user").where("id", id).first();

    return new Promise<UserDTO>((resolve, reject) => {
      query
        .then((user) => {
          if (!user) throw createError(400, "User Absent");

          return resolve({
            id: user.id,
            push_token: user.push_token,
            hashed_password: user.hashed_password,
            last_accessed_at: user.last_accessed_at,
          });
        })
        .catch(reject);
    });
  },

  updateAccessTime(knex, id) {
    const query = knex("user")
      .where("id", id)
      .update("last_accessed_at", knex.fn.now());

    return new Promise<void>((resolve, reject) => {
      query.then(() => resolve()).catch(reject);
    });
  },

  insert(knex, { id, hashed_password }) {
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

  updatePushToken(knex, { id, push_token }) {
    const query = knex("user").where("id", id).update("push_token", push_token);

    return new Promise<void>((resolve, reject) => {
      query
        .then(() => resolve())
        .catch((err: QueryError) => {
          if (err.code === "ER_DATA_TOO_LONG")
            return reject(createError(400, "Property Too Long"));

          return reject(err);
        });
    });
  },
};
