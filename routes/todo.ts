import express from "express";
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from "routes/index";
import todo from "model/todo";

const router = express.Router();

router
  .route("/")
  .get(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (_req, res, _next) => {
      return res
        .status(200)
        .json({ message: "Query Accepted", data: await todo.getAll() });
    })
  )
  .post(
    genContentNegotiator(["json"]),
    asyncHandlerWrapper(async (req, res, _next) => {
      const { content, deadline } = req.body;
      await todo.add(content, deadline);
      return res.status(201).json({ message: "todo Created" });
    })
  )
  .all(genMethodNotAllowedHandler(["GET", "POST"]));

export default router;
