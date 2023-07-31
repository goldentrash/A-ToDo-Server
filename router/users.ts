import express from "express";
import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type QueryError } from "mysql2";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from "router/helper";
import { pool, userModel, type User } from "model";

export const usersRouter = express.Router();

usersRouter
  .route("/:user_id/token")
  // sign in
  .post(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();

      try {
        const { user_id: id } = req.params;
        const { password } = req.body;
        if (!password) throw createError(400, "Property Absent");
        if (typeof password !== "string")
          throw createError(400, "Property Invalid");

        const [rows] = await userModel.find(connection, id);
        const user = rows[0] as User;
        if (!user) throw createError(400, "User Absent");
        if (!(await bcrypt.compare(password, user.hashed_password)))
          throw createError(400, "Password Invalid");

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

usersRouter
  .route("/")
  // sign up
  .post(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const { id, password } = req.body;
        if (!id || !password) throw createError(400, "Property Absent");
        if (typeof password !== "string")
          throw createError(400, "Property Invalid");

        await userModel
          .register(connection, {
            id,
            hashed_password: await bcrypt.hash(password, 5),
          })
          .catch((err: QueryError) => {
            if (err.code === "ER_DUP_ENTRY")
              throw createError(400, "User ID Duplicated");

            if (err.code === "ER_DATA_TOO_LONG")
              throw createError(400, "User ID Too Long");

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
