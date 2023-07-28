import express from "express";
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
        const { userId, password } = req.body;
        await user.register(connection, {
          id: userId,
          salt: "randStr",
          hashedPassword: password,
        });
        connection.commit();

        return res.status(201).json({
          message: "user created",
          data: { user: "usr" },
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
