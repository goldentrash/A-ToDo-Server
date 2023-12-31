import { type Knex } from "knex";

export type UserEntity = {
  id: string;
  push_token: string | null;
  hashed_password: string;
  registerd_at: string;
  last_accessed_at: string;
};

export type TaskEntity = {
  id: number;
  user_id: UserEntity["id"];
  progress: "todo" | "doing" | "done";
  for_unique_doing_per_user: string;
  content: string;
  deadline: string;
  registerd_at: string;
  started_at: string | null;
  finished_at: string | null;
};

declare module "knex/types/tables" {
  interface Tables {
    user: Knex.CompositeTableType<
      UserEntity,
      Pick<UserEntity, "id" | "hashed_password">,
      Partial<Omit<UserEntity, "id" | "registerd_at">>
    >;

    task: Knex.CompositeTableType<
      TaskEntity,
      Pick<TaskEntity, "user_id" | "content" | "deadline">,
      Partial<Omit<TaskEntity, "id" | "user_id" | "for_unique_doing_per_user">>
    >;
  }
}
