import { type Knex } from "knex";

export type UserDTO = {
  id: string;
  hashed_password: string;
};

export type UserDAO = {
  findById(knex: Knex, id: UserDTO["id"]): Promise<UserDTO>;
  updateAccessTime(knex: Knex, id: UserDTO["id"]): Promise<void>;
  insert(knex: Knex, user: UserDTO): Promise<void>;
};

export type TaskDTO = {
  id: number;
  user_id: string;
  progress: "todo" | "doing" | "done";
  content: string;
  memo: string;
  deadline: string;
  registerd_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type SearchOption = {
  sort: keyof TaskDTO | null;
  filter: { progress: string[] | null };
};

export type TaskDAO = {
  findById(kne: Knex, id: TaskDTO["id"]): Promise<TaskDTO>;
  findByUser(
    kne: Knex,
    user_id: TaskDTO["user_id"],
    searchOption: SearchOption
  ): Promise<TaskDTO[]>;
  insert(
    kne: Knex,
    {
      user_id,
      content,
      deadline,
    }: Pick<TaskDTO, "user_id" | "content" | "deadline">
  ): Promise<TaskDTO["id"]>;
  updateProgress(kne: Knex, taskDTO: TaskDTO): Promise<void>;
  setMemo(kne: Knex, taskDTO: TaskDTO): Promise<void>;
};
