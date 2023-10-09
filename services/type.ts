import { type Knex } from "knex";

export type UserDTO = {
  id: string;
  hashed_password: string;
  last_accessed_at: string;
};

export type UserDAO = {
  findById(knex: Knex, id: UserDTO["id"]): Promise<UserDTO>;
  updateAccessTime(knex: Knex, id: UserDTO["id"]): Promise<void>;
  insert(
    knex: Knex,
    user: Pick<UserDTO, "id" | "hashed_password">
  ): Promise<void>;
};

export type TaskDTO = {
  id: number;
  user_id: string;
  progress: "todo" | "doing" | "done";
  content: string;
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
  findById(knex: Knex, id: TaskDTO["id"]): Promise<TaskDTO>;
  findByUser(
    knex: Knex,
    user_id: TaskDTO["user_id"],
    searchOption: SearchOption
  ): Promise<TaskDTO[]>;
  insert(
    knex: Knex,
    task: Pick<TaskDTO, "user_id" | "content" | "deadline">
  ): Promise<TaskDTO["id"]>;
  updateProgress(knex: Knex, task: TaskDTO): Promise<void>;
  updateContent(knex: Knex, task: TaskDTO): Promise<void>;
};
