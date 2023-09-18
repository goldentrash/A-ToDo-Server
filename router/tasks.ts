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
    .route("/:task_id/content")
    // update content
    .put(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        // Validation
        const authorization = req.get("Authorization");
        if (!authorization) return next(createError(401, "Not Authorized"));

        const { user_id } = userService.verify(authorization);
        await userService.updateAccessTime(user_id);

        const { task_id } = req.params;
        const { content } = req.body;
        if (isNaN(parseInt(task_id)))
          return next(createError(400, "Task ID Invalid"));
        if (!content) return next(createError(400, "Property Absent"));

        // Process
        const updatedTask = await taskService.updateContent({
          id: parseInt(task_id),
          user_id,
          content,
        });

        // Response
        const response = {
          task: {
            id: updatedTask.id,
            progress: updatedTask.progress,
            content: updatedTask.content,
            deadline: updatedTask.deadline,
            registerd_at: updatedTask.registerd_at,
            started_at: updatedTask.started_at,
            finished_at: updatedTask.finished_at,
          },
        };
        return res.status(200).json({
          message: "Memo Updated",
          data: response,
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
        // Validation
        const authorization = req.get("Authorization");
        if (!authorization) return next(createError(401, "Not Authorized"));

        const { user_id } = userService.verify(authorization);
        await userService.updateAccessTime(user_id);

        const { task_id } = req.params;
        const { action }: { action?: "start" | "finish" } = req.body;
        if (isNaN(parseInt(task_id)))
          return next(createError(400, "Task ID Invalid"));
        if (!action) return next(createError(400, "Property Absent"));

        // Process
        switch (action) {
          case "start": {
            const startedTask = await taskService.start({
              id: parseInt(task_id),
              user_id,
            });

            // Response
            const response = {
              task: {
                id: startedTask.id,
                progress: startedTask.progress,
                content: startedTask.content,
                deadline: startedTask.deadline,
                registerd_at: startedTask.registerd_at,
                started_at: startedTask.started_at,
                finished_at: startedTask.finished_at,
              },
            };
            return res.status(200).json({
              message: "Task Started",
              data: response,
            });
          }
          case "finish": {
            const finishedTask = await taskService.finish({
              id: parseInt(task_id),
              user_id,
            });

            // Response
            const response = {
              task: {
                id: finishedTask.id,
                progress: finishedTask.progress,
                content: finishedTask.content,
                deadline: finishedTask.deadline,
                registerd_at: finishedTask.registerd_at,
                started_at: finishedTask.started_at,
                finished_at: finishedTask.finished_at,
              },
            };
            return res.status(200).json({
              message: "Task Finished",
              data: response,
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
        // Validation
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

        // Process
        const taskList = await taskService.search(user_id, option);

        // Response
        const response = {
          taskList: taskList.map((task) => ({
            id: task.id,
            progress: task.progress,
            content: task.content,
            deadline: task.deadline,
            registerd_at: task.registerd_at,
            started_at: task.started_at,
            finished_at: task.finished_at,
          })),
        };
        return res.status(200).json({
          message: "Query Accepted",
          data: response,
        });
      })
    )
    // register task
    .post(
      genContentNegotiator(["json"]),
      asyncHandlerWrapper(async (req, res, next) => {
        // Validation
        const authorization = req.get("Authorization");
        if (!authorization) return next(createError(401, "Not Authorized"));

        const { user_id } = userService.verify(authorization);
        await userService.updateAccessTime(user_id);

        const { content, deadline } = req.body;
        if (!content || !deadline)
          return next(createError(400, "Property Absent"));
        if (typeof content !== "string" || typeof deadline !== "string")
          return next(createError(400, "Property Invalid"));

        // Process
        const registeredTask = await taskService.register({
          user_id,
          content,
          deadline,
        });

        // Response
        const response = {
          task: {
            id: registeredTask.id,
            progress: registeredTask.progress,
            content: registeredTask.content,
            deadline: registeredTask.deadline,
            registerd_at: registeredTask.registerd_at,
            started_at: registeredTask.started_at,
            finished_at: registeredTask.finished_at,
          },
        };
        return res.status(201).json({
          message: "Task Created",
          data: response,
        });
      })
    )
    .all(genMethodNotAllowedHandler(["GET", "POST"]));

  return tasksRouter;
};
