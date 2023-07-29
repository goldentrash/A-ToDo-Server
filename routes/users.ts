import express from "express";
import createError from "http-errors";
import bcrypt from "bcrypt";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from "routes/helper";
import { pool, user } from "model";

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

        await user.register(connection, {
          id,
          hashed_password: await bcrypt.hash(password, 5),
        });
        const [rows] = await user.find(connection, id);

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
