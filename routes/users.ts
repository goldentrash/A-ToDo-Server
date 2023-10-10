import express from "express";
import createError from "http-errors";
import { type UserService } from "../services";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from "./helper";

export const genUsersRouter = (userService: UserService) => {
  const usersRouter = express.Router();

  usersRouter
    .route("/:user_id/access-token")

    // sign in
    .post(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        // Validation
        const { user_id: id } = req.params;
        const { password } = req.body;
        if (!password) return next(createError(400, "Property Absent"));
        if (typeof password !== "string")
          return next(createError(400, "Property Invalid"));

        // Process
        const token = await userService.signIn(id, password);

        // Response
        const response = { token };
        return res.status(200).json({
          message: "Access Accepted",
          data: response,
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
        // Validation
        const { id, password } = req.body;
        if (!id || !password) return next(createError(400, "Property Absent"));
        if (typeof password !== "string")
          return next(createError(400, "Property Invalid"));

        // Process
        await userService.signUp(id, password);

        // Response
        const response = { user_id: id };
        return res.status(201).json({
          message: "User Created",
          data: response,
        });
      })
    )

    .all(genMethodNotAllowedHandler(["POST"]));

  return usersRouter;
};
