import express from "express";
import createError from "http-errors";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from "router/helper";
import { type UserService } from "service";

export const genUsersRouter = (userService: UserService) => {
  const usersRouter = express.Router();

  usersRouter
    .route("/:user_id/token")
    // sign in
    .post(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        const { user_id: id } = req.params;
        const { password } = req.body;
        if (!password) return next(createError(400, "Property Absent"));
        if (typeof password !== "string")
          return next(createError(400, "Property Invalid"));

        const token = await userService.signIn(id, password);
        return res.status(200).json({
          message: "Access Accepted",
          data: { token },
        });
      })
    )
    .all(genMethodNotAllowedHandler(["POST"]));

  usersRouter
    .route("/")
    // sign up
    .post(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        const { id, password } = req.body;
        if (!id || !password) return next(createError(400, "Property Absent"));
        if (typeof password !== "string")
          return next(createError(400, "Property Invalid"));

        await userService.signUp(id, password);
        return res.status(201).json({
          message: "User Created",
        });
      })
    )
    .all(genMethodNotAllowedHandler(["POST"]));

  return usersRouter;
};
