import { Knex } from "knex";

declare module "knex/types/tables" {
  interface User {
    id: string;
    hashed_password: string;
    registerd_at: string;
    last_accessed_at: string;
  }

  interface TaskBase {
    id: number;
    user_id: User["id"];
    for_unique_doing_per_user: string;
    content: string;
    memo: string;
    deadline: string;
  }

  interface Todo extends TaskBase {
    progress: "todo";
    registerd_at: string;
  }

  interface Doing extends TaskBase {
    progress: "doing";
    registerd_at: string;
    started_at: string;
  }

  interface Done extends TaskBase {
    progress: "done";
    registerd_at: string;
    started_at: string;
    finished_at: string;
  }

  type Task = Todo | Doing | Done;

  interface Tables {
    user: Knex.CompositeTableType<
      User,
      Pick<User, "id" | "hashed_password">,
      Partial<Omit<User, "id" | "registerd_at">>
    >;

    task: Knex.CompositeTableType<
      Task,
      Pick<Task, "user_id" | "content" | "deadline">,
      Partial<Omit<Task, "id" | "user_id" | "for_unique_doing_per_user">>
    >;
  }
}
