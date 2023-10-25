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
  .all(methodNotAllowedHandler(['GET']));

module.exports = router;
