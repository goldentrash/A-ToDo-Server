import { type QueryError } from "mysql2/promise";
import createError from "http-errors";
import { type Knex } from "knex";
import { type TaskDAO, type TaskDTO, type SearchOption } from "service";

export const taskRepo: TaskDAO = {
  findById(knex: Knex, id: TaskDTO["id"]) {
    const query = knex("task").where("id", id).first();

    return new Promise<TaskDTO>((resolve, reject) => {
      query.then((task) => {
        if (!task) return reject(createError(400, "Task Absent"));

        return resolve({
          id: task.id,
          user_id: task.user_id,
          progress: task.progress,
          content: task.content,
          deadline: task.deadline,
          registerd_at: task.registerd_at,
          started_at: task.started_at,
          finished_at: task.finished_at,
        });
      });
    });
  },

  findByUser(
    knex: Knex,
    user_id: TaskDTO["user_id"],
    { sort, filter: { progress } }: SearchOption
  ) {
    const query = knex("task").where("user_id", user_id);
    if (progress) query.whereIn("progress", progress);
    if (sort) query.orderBy(sort);

    return new Promise<TaskDTO[]>((resolve, _reject) => {
      query.then((taskArr) => {
        return resolve(
          taskArr.map((task) => ({
            id: task.id,
            user_id: task.user_id,
            progress: task.progress,
            content: task.content,
            deadline: task.deadline,
            registerd_at: task.registerd_at,
            started_at: task.started_at,
            finished_at: task.finished_at,
          }))
        );
      });
    });
  },

  insert(
    knex: Knex,
    {
      user_id,
      content,
      deadline,
    }: Pick<TaskDTO, "user_id" | "content" | "deadline">
  ) {
    const query = knex("task").insert({ user_id, content, deadline });

    return new Promise<TaskDTO["id"]>((resolve, reject) => {
      query
        .then(([id]) => {
          return resolve(id);
        })
        .catch((err: QueryError) => {
          if (err.code === "ER_TRUNCATED_WRONG_VALUE")
            return reject(createError(400, "Property Invalid"));

          if (err.code === "ER_DATA_TOO_LONG")
            return reject(createError(400, "Content Too Long"));

          return reject(err);
        });
    });
  },

  updateProgress(knex: Knex, { id, progress }: TaskDTO) {
    switch (progress) {
      case "todo":
        throw Error("unreachable case");
      case "doing":
        {
          const query = knex("task")
            .where("id", id)
            .update("progress", "doing")
            .update("started_at", knex.fn.now());

          return new Promise<void>((resolve, reject) => {
            query
              .then(() => resolve())
              .catch((err: QueryError) => {
                if (err.code === "ER_DUP_ENTRY")
                  return reject(createError(400, "User Busy"));

                return reject(err);
              });
          });
        }
        break;
      case "done":
        {
          const query = knex("task")
            .where("id", id)
            .update("progress", "done")
            .update("finished_at", knex.fn.now());

          return new Promise<void>((resolve, reject) => {
            query
              .then(() => resolve())
              .catch((err: QueryError) => {
                if (err.code === "ER_CHECK_CONSTRAINT_VIOLATED")
                  return reject(createError(400, "Task Unstarted"));

                return reject(err);
              });
          });
        }
        break;
      default:
        return ((_progress: never) => {
          throw Error("unreachable case");
        })(progress);
    }
  },

  updateContent(knex: Knex, { id, content }: TaskDTO) {
    const query = knex("task").where("id", id).update("content", content);

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
