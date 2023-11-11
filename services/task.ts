import createError from "http-errors";
import { knex, taskRepo } from "../repositories";
import { type TaskDTO, type SearchOption } from "./type";

export const taskService = {
  async search(
    user_id: TaskDTO["user_id"],
    searchOption: SearchOption
  ): Promise<TaskDTO[]> {
    return await taskRepo.findByUser(knex, user_id, searchOption);
  },

  async register({
    user_id,
    content,
    deadline,
  }: Pick<TaskDTO, "user_id" | "content" | "deadline">): Promise<TaskDTO> {
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

  async start({
    id,
    user_id,
  }: Pick<TaskDTO, "id" | "user_id">): Promise<TaskDTO> {
    const trx = await knex.transaction();

    try {
      let taskDTO = await taskRepo.findById(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      await taskRepo.updateProgress(trx, { ...taskDTO, progress: "doing" });
      taskDTO = await taskRepo.findById(trx, id);

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },

  async finish({
    id,
    user_id,
  }: Pick<TaskDTO, "id" | "user_id">): Promise<TaskDTO> {
    const trx = await knex.transaction();

    try {
      let taskDTO = await taskRepo.findById(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      await taskRepo.updateProgress(trx, { ...taskDTO, progress: "done" });
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
  }: Pick<TaskDTO, "id" | "user_id" | "content">): Promise<TaskDTO> {
    const trx = await knex.transaction();

    try {
      const taskDTO = await taskRepo.findById(trx, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      await taskRepo.updateContent(trx, { ...taskDTO, content });

      trx.commit();
      return taskDTO;
    } catch (err) {
      trx.rollback();
      throw err;
    }
  },
};
