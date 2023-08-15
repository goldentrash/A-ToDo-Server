import { type PoolConnection } from "mysql2/promise";

export type UserDTO = {
  id: string;
  hashed_password: string;
};

export type UserDAO = {
  find(conn: PoolConnection, id: UserDTO["id"]): Promise<UserDTO>;
  updateAccessTime(conn: PoolConnection, id: UserDTO["id"]): Promise<void>;
  register(conn: PoolConnection, user: UserDTO): Promise<void>;
};

export type TaskDTO = {
  id: string;
  user_id: string;
  progress: "todo" | "doing" | "done";
  content: string;
  memo: string;
  deadline: string;
};

export type TaskDAO = {
  find(conn: PoolConnection, id: TaskDTO["id"]): Promise<TaskDTO>;
  findByUser(
    conn: PoolConnection,
    user_id: TaskDTO["user_id"]
  ): Promise<TaskDTO[]>;
  register(
    conn: PoolConnection,
    {
      user_id,
      content,
      deadline,
    }: Pick<TaskDTO, "user_id" | "content" | "deadline">
  ): Promise<TaskDTO["id"]>;
  start(conn: PoolConnection, taskDTO: TaskDTO): Promise<void>;
  finish(conn: PoolConnection, taskDTO: TaskDTO): Promise<void>;
  setMemo(conn: PoolConnection, taskDTO: TaskDTO): Promise<void>;
};
