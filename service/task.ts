import createError from "http-errors";
import { knex } from "repository";
import { type TaskDAO, type SearchOption } from "./type";

export type TaskService = ReturnType<typeof genTaskService>;

export const genTaskService = (taskRepo: TaskDAO) => ({
  async search(user_id: string, searchOption: SearchOption) {
    return await taskRepo.findByUser(knex, user_id, searchOption);
  },
  async register(user_id: string, content: string, deadline: string) {
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
  async start(id: number, user_id: string) {
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
  async finish(id: number, user_id: string) {
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
  async updateMemo(id: number, user_id: string, memo: string) {
    const trx = await knex.transaction();

    try {
      const taskDTO = await taskRepo.findById(trx, id);
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
