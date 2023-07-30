import express from "express";
import createError from "http-errors";
import type { QueryError } from "mysql2";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
  userAuthenticator,
} from "routes/helper";
import { pool, userModel, taskModel } from "model";
import type { Task, Todo, Doing, Done } from "model";

export const tasksRouter = express.Router();

tasksRouter
  .route("/:task_id/memo")
  // update memo
  .put(
    genContentNegotiator(["json"]),
    userAuthenticator,
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const { task_id } = req.params;
        const { user_id } = res.locals;
        const { memo } = req.body;
        if (!memo) throw createError(400, "Property Absent");
        await taskModel
          .setMemo(connection, task_id, memo)
          .catch((err: QueryError) => {
            if (err.code === "ER_DATA_TOO_LONG")
              throw createError(400, "Property Too Long");

            if (err.code === "ER_TRUNCATED_WRONG_VALUE")
              throw createError(400, "Task ID Invalid");

            throw err;
          });

        const [rows] = await taskModel.find(connection, task_id);
        if (rows.length === 0) throw createError(400, "Task Absent");

        connection.commit();

        userModel.updateAccessTime(connection, user_id);
        return res.status(200).json({
          message: "memo updated",
          data: { task: rows[0] },
        });
      } catch (err) {
        connection.rollback();
        return next(err);
      } finally {
        connection.release();
      }
    })
  )
  .all(genMethodNotAllowedHandler(["PUT"]));

tasksRouter
  .route("/:task_id")
  // progress task
  .patch(
    genContentNegotiator(["json"]),
    userAuthenticator,
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const { task_id } = req.params;
        const { user_id } = res.locals;
        const { action } = req.body;
        if (!action) throw createError(400, "Property Absent");
        if (action === "start")
          await taskModel
            .start(connection, task_id)
            .catch((err: QueryError) => {
              if (err.code === "ER_DUP_ENTRY")
                throw createError(400, "User Busy");

              if (err.code === "ER_TRUNCATED_WRONG_VALUE")
                throw createError(400, "Task ID Invalid");

              throw err;
            });
        else if (action === "finish")
          await taskModel
            .finish(connection, task_id)
            .catch((err: QueryError) => {
              if (err.code === "ER_CHECK_CONSTRAINT_VIOLATED")
                throw createError(400, "Task Unstarted");

              if (err.code === "ER_TRUNCATED_WRONG_VALUE")
                throw createError(400, "Task ID Invalid");

              throw err;
            });
        else throw createError(400, "Property Invalid");

        const [rows] = await taskModel.find(connection, task_id);
        if (rows.length === 0) throw createError(400, "Task Absent");

        connection.commit();

        userModel.updateAccessTime(connection, user_id);
        return res.status(200).json({
          message: action === "start" ? "task started" : "task finished",
          data: { task: rows[0] },
        });
      } catch (err) {
        connection.rollback();
        return next(err);
      } finally {
        connection.release();
      }
    })
  )
  .all(genMethodNotAllowedHandler(["PATCH"]));

tasksRouter
  .route("/")
  // get tasks
  .get(
    genContentNegotiator(["json"]),
    userAuthenticator,
    async (_req, res, next) => {
      const connection = await pool.getConnection();

      try {
        const { user_id } = res.locals;

        const [rows] = await taskModel.findByUser(connection, user_id);
        const [todoList, doing, doneList] = rows.reduce<
          [Todo[], Doing | null, Done[]]
        >(
          (accumulator, rowDataPacket) => {
            const task = rowDataPacket as Task;
            const [todoList, doing, doneList] = accumulator;

            switch (task.progress) {
              case "todo":
                return [[task, ...todoList], doing, doneList];
              case "doing":
                return [todoList, task, doneList];
              case "done":
                return [todoList, doing, [task, ...doneList]];
              default:
                return ((_: never): never => {
                  throw Error("unreachable case");
                })(task);
            }
          },
          [[], null, []]
        );

        // XXX filter
        // const { progress } = req.query;

        userModel.updateAccessTime(connection, user_id);
        return res.status(200).json({
          message: "query accepted",
          data: {
            // ...(todoList && { todoList }),
            // ...(doing && { doing }),
            // ...(doneList && { doneList }),
            todoList,
            doing,
            doneList,
          },
        });
      } catch (err) {
        return next(err);
      } finally {
        connection.release();
      }
    }
  )
  // register task
  .post(
    genContentNegotiator(["json"]),
    userAuthenticator,
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const { user_id } = res.locals;
        const { content, deadline } = req.body;
        if (!content || !deadline) throw createError(400, "Property Absent");
        if (typeof content !== "string" || typeof deadline !== "string")
          throw createError(400, "Property Invalid");

        const [row] = await taskModel
          .register(connection, { user_id, content, deadline })
          .catch((err: QueryError) => {
            if (err.code === "ER_TRUNCATED_WRONG_VALUE")
              throw createError(400, "Property Invalid");

            if (err.code === "ER_DATA_TOO_LONG")
              throw createError(400, "Content Too Long");

            throw err;
          });
        const [rows] = await taskModel.find(
          connection,
          row.insertId.toString()
        );

        connection.commit();

        userModel.updateAccessTime(connection, user_id);
        return res.status(201).json({
          message: "task created",
          data: { task: rows[0] },
        });
      } catch (err) {
        connection.rollback();
        return next(err);
      } finally {
        connection.release();
      }
    })
  )
  .all(genMethodNotAllowedHandler(["GET", "POST"]));
