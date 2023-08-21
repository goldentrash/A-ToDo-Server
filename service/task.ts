import createError from "http-errors";
import { pool } from "repository";
import { type TaskDAO, type SearchOption } from "./type";

export type TaskService = ReturnType<typeof genTaskService>;

export const genTaskService = (taskRepo: TaskDAO) => ({
  async getTasksByUser(user_id: string, searchOption: SearchOption) {
    const conn = await pool.getConnection();

    try {
      const taskDTOs = await taskRepo.findByUser(conn, user_id, searchOption);
      return taskDTOs;
    } finally {
      conn.release();
    }
  },
  async register(user_id: string, content: string, deadline: string) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const insertId = await taskRepo.register(conn, {
        user_id,
        content,
        deadline,
      });
      const taskDTO = await taskRepo.find(conn, insertId);

      conn.commit();
      return taskDTO;
    } catch (err) {
      conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
  async startTask(id: string, user_id: string) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const taskDTO = await taskRepo.find(conn, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.progress = "doing";
      await taskRepo.start(conn, taskDTO);

      conn.commit();
      return taskDTO;
    } catch (err) {
      conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
  async finishTask(id: string, user_id: string) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const taskDTO = await taskRepo.find(conn, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.progress = "done";
      await taskRepo.finish(conn, taskDTO);

      conn.commit();
      return taskDTO;
    } catch (err) {
      conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
  async updateMemo(id: string, user_id: string, memo: string) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const taskDTO = await taskRepo.find(conn, id);
      if (taskDTO.user_id !== user_id) throw createError(403, "Forbidden");

      taskDTO.memo = memo;
      await taskRepo.setMemo(conn, taskDTO);

      conn.commit();
      return taskDTO;
    } catch (err) {
      conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
});
