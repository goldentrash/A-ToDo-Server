import express from "express";
import createError from "http-errors";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from "./helper";
import { type TaskService, type UserService, type SearchOption } from "service";

export const genTasksRouter = (
  taskService: TaskService,
  userService: UserService
) => {
  const tasksRouter = express.Router();

  tasksRouter
    .route("/:task_id/memo")
    // update memo
    .put(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        const authorization = req.get("Authorization");
        if (!authorization) return next(createError(401, "Not Authorized"));

        const { user_id } = userService.verify(authorization);
        await userService.updateAccessTime(user_id);

        const { task_id } = req.params;
        const { memo } = req.body;
        if (isNaN(parseInt(task_id)))
          return next(createError(400, "Task ID Invalid"));
        if (!memo) return next(createError(400, "Property Absent"));

        const updatedTask = await taskService.updateMemo(
          parseInt(task_id),
          user_id,
          memo
        );
        return res.status(200).json({
          message: "Memo Updated",
          data: { task: updatedTask },
        });
      })
    )
    .all(genMethodNotAllowedHandler(["PUT"]));

  tasksRouter
    .route("/:task_id")
    // progress task
    .patch(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        const authorization = req.get("Authorization");
        if (!authorization) return next(createError(401, "Not Authorized"));

        const { user_id } = userService.verify(authorization);
        await userService.updateAccessTime(user_id);

        const { task_id } = req.params;
        const { action }: { action?: "start" | "finish" } = req.body;
        if (isNaN(parseInt(task_id)))
          return next(createError(400, "Task ID Invalid"));
        if (!action) return next(createError(400, "Property Absent"));

        switch (action) {
          case "start": {
            const startedTask = await taskService.start(
              parseInt(task_id),
              user_id
            );
            return res.status(200).json({
              message: "Task Started",
              data: { task: startedTask },
            });
          }
          case "finish": {
            const finishedTask = await taskService.finish(
              parseInt(task_id),
              user_id
            );
            return res.status(200).json({
              message: "Task Finished",
              data: { task: finishedTask },
            });
          }
          default:
            return ((_action: never) =>
              next(createError(400, "Property Invalid")))(action);
        }
      })
    )
    .all(genMethodNotAllowedHandler(["PATCH"]));

  tasksRouter
    .route("/")
    // get tasks
    .get(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        const authorization = req.get("Authorization");
        if (!authorization) return next(createError(401, "Not Authorized"));

        const { user_id } = userService.verify(authorization);
        await userService.updateAccessTime(user_id);

        const option: SearchOption = { sort: null, filter: { progress: null } };
        const { sort, progress } = req.query;
        if (sort === "deadline") option.sort = "deadline";
        if (typeof progress === "string") option.filter.progress = [progress];
        if (Array.isArray(progress))
          option.filter.progress = progress as string[];

        const taskList = await taskService.search(user_id, option);
        return res.status(200).json({
          message: "Query Accepted",
          data: { taskList },
        });
      })
    )
    // register task
    .post(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        const authorization = req.get("Authorization");
        if (!authorization) return next(createError(401, "Not Authorized"));

        const { user_id } = userService.verify(authorization);
        await userService.updateAccessTime(user_id);

        const { content, deadline } = req.body;
        if (!content || !deadline)
          return next(createError(400, "Property Absent"));
        if (typeof content !== "string" || typeof deadline !== "string")
          return next(createError(400, "Property Invalid"));

        const registeredTask = await taskService.register(
          user_id,
          content,
          deadline
        );
        return res.status(201).json({
          message: "Task Created",
          data: { task: registeredTask },
        });
      })
    )
    .all(genMethodNotAllowedHandler(["GET", "POST"]));

  return tasksRouter;
};
