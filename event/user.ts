import debug from "debug";
import EventEmitter from "events";
import { type PoolConnection } from "mysql2/promise";
import { type User, type UserDAO } from "model";

const errStream = debug("a-todo:error:userChannel");

export type UserChannel = {
  on(
    event: "access",
    callback: (conn: PoolConnection, userDAO: UserDAO, id: User["id"]) => void
  ): void;
  emit(
    event: "access",
    ...args: Parameters<Parameters<UserChannel["on"]>[1]>
  ): void;
};

export const userChannel = new EventEmitter() as UserChannel;

userChannel.on("access", (conn, userDAO, id) =>
  userDAO.updateAccessTime(conn, id).catch((err) => errStream("%O", err))
);
