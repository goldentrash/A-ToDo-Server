const router = require('express').Router();
const {
  asyncHandlerWrapper,
  contentNegotiator,
  methodNotAllowedHandler,
} = require('./index');
const todo = require('../model/todo');

router
  .route('/')
  .get(
    contentNegotiator('json'),
    asyncHandlerWrapper(async (req, res, next) => {
      return res
        .status(200)
        .json({ message: 'Query Accepted', data: await todo.get() });
    })
  )
  .post(
    contentNegotiator('json'),
    asyncHandlerWrapper(async (req, res, next) => {
      const { content, deadline } = req.body;
      await todo.add(content, deadline);
      return res.status(201).json({ message: 'todo Created' });
    })
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

module.exports = router;
