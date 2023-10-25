import { type Knex } from "knex";

export type UserDTO = {
  id: string;
  hashed_password: string;
};

export type UserDAO = {
  find(knex: Knex, id: UserDTO["id"]): Promise<UserDTO>;
  updateAccessTime(knex: Knex, id: UserDTO["id"]): Promise<void>;
  register(knex: Knex, user: UserDTO): Promise<void>;
};

export type TaskDTO = {
  id: number;
  user_id: string;
  progress: "todo" | "doing" | "done";
  content: string;
  memo: string;
  deadline: string;
};

export type SearchOption = {
  sort: keyof TaskDTO | null;
  filter: { progress: string[] | null };
};

export type TaskDAO = {
  find(kne: Knex, id: TaskDTO["id"]): Promise<TaskDTO>;
  findByUser(
    kne: Knex,
    user_id: TaskDTO["user_id"],
    searchOption: SearchOption
  ): Promise<TaskDTO[]>;
  register(
    kne: Knex,
    {
      user_id,
      content,
      deadline,
    }: Pick<TaskDTO, "user_id" | "content" | "deadline">
  ): Promise<TaskDTO["id"]>;
  start(kne: Knex, taskDTO: TaskDTO): Promise<void>;
  finish(kne: Knex, taskDTO: TaskDTO): Promise<void>;
  setMemo(kne: Knex, taskDTO: TaskDTO): Promise<void>;
};
