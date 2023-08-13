import {
  pool,
  type UserDAO,
  type TaskDAO,
  type Task,
  type Todo,
  type Doing,
  type Done,
} from "model";
import { userChannel } from "event";

export const genTaskService = (taskDAO: TaskDAO, userDAO: UserDAO) => ({
  async updateMemo(id: string, memo: string, user_id: string) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await taskDAO.setMemo(connection, id, memo);
      const updatedTask = await taskDAO.find(connection, id);

      connection.commit();
      return updatedTask;
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      userChannel.emit("access", connection, userDAO, user_id);
      connection.release();
    }
  },
  async startTask(id: string, user_id: string) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await taskDAO.start(connection, id);
      const startedTask = await taskDAO.find(connection, id);

      connection.commit();
      return startedTask;
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      userChannel.emit("access", connection, userDAO, user_id);
      connection.release();
    }
  },
  async finishTask(id: string, user_id: string) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await taskDAO.finish(connection, id);
      const finishedTask = await taskDAO.find(connection, id);

      connection.commit();
      return finishedTask;
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      userChannel.emit("access", connection, userDAO, user_id);
      connection.release();
    }
  },
  async getTasksByUser(user_id: string) {
    const connection = await pool.getConnection();

    try {
      const taskArr = await taskDAO.findByUser(connection, user_id);
      const [todoList, doing, doneList] = taskArr.reduce<
        [Todo[], Doing | null, Done[]]
      >(
        (acc, curr: Task) => {
          const [todoList, doing, doneList] = acc;

          switch (curr.progress) {
            case "todo":
              return [[curr, ...todoList], doing, doneList];
            case "doing":
              return [todoList, curr, doneList];
            case "done":
              return [todoList, doing, [curr, ...doneList]];
            default:
              return ((_: never): never => {
                throw Error("unreachable case");
              })(curr);
          }
        },
        [[], null, []]
      );

      return [todoList, doing, doneList];
    } finally {
      userChannel.emit("access", connection, userDAO, user_id);
      connection.release();
    }
  },
  async register(user_id: string, content: string, deadline: string) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const insertId = await taskDAO.register(connection, {
        user_id,
        content,
        deadline,
      });
      const registeredTask = await taskDAO.find(connection, insertId);

      connection.commit();
      return registeredTask;
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      userChannel.emit("access", connection, userDAO, user_id);
      connection.release();
    }
  },
});
