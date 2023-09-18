import createError from "http-errors";
import { knex } from "repository";
import { type TaskDTO, type TaskDAO, type SearchOption } from "./type";

export type TaskService = ReturnType<typeof genTaskService>;

export const genTaskService = (taskRepo: TaskDAO) => ({
  async search(user_id: TaskDTO["user_id"], searchOption: SearchOption) {
    return await taskRepo.findByUser(knex, user_id, searchOption);
  },
  async register({
    user_id,
    content,
    deadline,
  }: Pick<TaskDTO, "user_id" | "content" | "deadline">) {
    const trx = await knex.transaction();

    try {
      const insertId = await taskRepo.insert(trx, {
        user_id,
        content,
        deadline,
      });
      const taskDTO = await taskRepo.findById(trx, insertId);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
  async start({ id, user_id }: Pick<TaskDTO, "id" | "user_id">) {
    const trx = await knex.transaction();

    try {
      let taskDTO = await taskRepo.findById(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.progress = "doing";
      await taskRepo.updateProgress(trx, taskDTO);
      taskDTO = await taskRepo.findById(trx, id);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
  async finish({ id, user_id }: Pick<TaskDTO, "id" | "user_id">) {
    const trx = await knex.transaction();

    try {
      let taskDTO = await taskRepo.findById(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.progress = "done";
      await taskRepo.updateProgress(trx, taskDTO);
      taskDTO = await taskRepo.findById(trx, id);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
  async updateContent({
    id,
    user_id,
    content,
  }: Pick<TaskDTO, "id" | "user_id" | "content">) {
    const trx = await knex.transaction();

    try {
      const taskDTO = await taskRepo.findById(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.content = content;
      await taskRepo.updateContent(trx, taskDTO);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
});
