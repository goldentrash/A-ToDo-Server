import express from "express";
import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from "routes/helper";
import { pool, userModel } from "model";
import { User } from "model";

export const userRouter = express.Router();

userRouter
  .route("/")
  .post(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const { id, password } = req.body;
        if (!id || !password) throw createError(400, "missing properties");

        await userModel.register(connection, {
          id,
          hashed_password: await bcrypt.hash(password, 5),
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
  .route("/:userId/token")
  .post(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (req, res, next) => {
      const connection = await pool.getConnection();

      try {
        const { userId: id } = req.params;
        const { password } = req.body;
        if (!id || !password) throw createError(400, "missing properties");

        const [rows] = await userModel.find(connection, id);
        const user = rows[0] as User;
        if (!bcrypt.compare(password, user.hashed_password))
          throw createError(400, "mismatched password");

        const token = jwt.sign(
          { userId: id },
          // disable-eslint-next-line @typescript-eslint/no-non-null-assertion
          process.env.JWT_SECRET!,
          { expiresIn: "1 days" }
        );

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
