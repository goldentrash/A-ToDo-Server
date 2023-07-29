import express from "express";
import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { QueryError } from "mysql2";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
  userAuthenticator,
} from "routes/helper";
import { pool, userModel, taskModel } from "model";
import type { User, Task, Todo, Doing, Done } from "model";

export const userRouter = express.Router();

userRouter
  .route("/")
  // sign up
  .post(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const { id, password } = req.body;
        if (!id || !password) throw createError(400, "missing properties");
        if (typeof password !== "string")
          throw createError(400, "invalid properties");

        await userModel
          .register(connection, {
            id,
            hashed_password: await bcrypt.hash(password, 5),
          })
          .catch((err: QueryError) => {
            if (err.code === "ER_DUP_ENTRY")
              throw createError(400, "duplicated user ID");

            if (err.code === "ER_DATA_TOO_LONG")
              throw createError(400, "too long user ID");

            throw err;
          });
        const [rows] = await userModel.find(connection, id);

        connection.commit();

        return res.status(201).json({
          message: "user created",
          data: { user: rows[0] },
        });
      } catch (err) {
        connection.rollback();
        return next(err);
      } finally {
        connection.release();
      }
    })
  )
  .all(genMethodNotAllowedHandler(["POST"]));

userRouter
  .route("/:user_id/token")
  // sign in
  .post(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();

      try {
        const { user_id: id } = req.params;
        const { password } = req.body;
        if (!id || !password) throw createError(400, "missing properties");
        if (typeof password !== "string")
          throw createError(400, "invalid properties");

        const [rows] = await userModel.find(connection, id);
        const user = rows[0] as User;
        if (!user) throw createError(400, "non-existent user");
        if (!bcrypt.compare(password, user.hashed_password))
          throw createError(400, "mismatched password");

        const token = jwt.sign(
          { userId: id },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          process.env.JWT_SECRET!,
          { expiresIn: "1 days" }
        );

        userModel.updateAccessTime(connection, id);
        return res.status(200).json({
          message: "access accepted",
          data: { token },
        });
      } catch (err) {
        return next(err);
      } finally {
        connection.release();
      }
    })
  )
  .all(genMethodNotAllowedHandler(["POST"]));

userRouter
  .route("/:user_id/tasks")
  // get tasks
  .get(
    genContentNegotiator(["json"]),
    userAuthenticator,
    async (req, res, next) => {
      const connection = await pool.getConnection();

      try {
        const { user_id: id } = req.params;
        if (!id) throw createError(400, "invalid properties");

        const [rows] = await taskModel.findAll(connection, id);
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

        userModel.updateAccessTime(connection, id);
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
  .all(genMethodNotAllowedHandler(["GET"]));
