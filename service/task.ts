import createError from "http-errors";
import { knex } from "repository";
import { type TaskDAO, type SearchOption } from "./type";

export type TaskService = ReturnType<typeof genTaskService>;

export const genTaskService = (taskRepo: TaskDAO) => ({
  async getTasksByUser(user_id: string, searchOption: SearchOption) {
    return await taskRepo.findByUser(knex, user_id, searchOption);
  },
  async register(user_id: string, content: string, deadline: string) {
    const trx = await knex.transaction();

    try {
      const insertId = await taskRepo.register(trx, {
        user_id,
        content,
        deadline,
      });
      const taskDTO = await taskRepo.find(trx, insertId);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
  async startTask(id: number, user_id: string) {
    const trx = await knex.transaction();

    try {
      const taskDTO = await taskRepo.find(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.progress = "doing";
      await taskRepo.start(trx, taskDTO);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
  async finishTask(id: number, user_id: string) {
    const trx = await knex.transaction();

    try {
      const taskDTO = await taskRepo.find(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.progress = "done";
      await taskRepo.finish(trx, taskDTO);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
  async updateMemo(id: number, user_id: string, memo: string) {
    const trx = await knex.transaction();

    try {
      const taskDTO = await taskRepo.find(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.memo = memo;
      await taskRepo.setMemo(trx, taskDTO);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
});
