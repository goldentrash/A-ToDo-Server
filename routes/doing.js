const router = require('express').Router();
const {
  asyncHandlerWrapper,
  contentNegotiator,
  methodNotAllowedHandler,
} = require('./index');
const doing = require('../model/doing');

router
  .route('/')
  .get(
    contentNegotiator('json'),
    asyncHandlerWrapper(async (req, res, next) => {
      return res
        .status(200)
        .json({ message: 'Query Accepted', data: await doing.get() });
    })
  )
  .post(
    contentNegotiator('json'),
    asyncHandlerWrapper(async (req, res, next) => {
      const { id } = req.body;
      await doing.add(id);
      return res.status(201).json({ message: 'doing Created' });
    })
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

module.exports = router;
