const router = require('express').Router();
const {
  asyncHandlerWrapper,
  contentNegotiator,
  methodNotAllowedHandler,
} = require('./index');
const done = require('../model/done');

router
  .route('/')
  .post(
    contentNegotiator('json'),
    asyncHandlerWrapper(async (req, res, next) => {
      const { id } = req.body;
      await done.add(id);
      return res.status(201).json({ message: 'done Created' });
    })
  )
  .all(methodNotAllowedHandler(['POST']));

module.exports = router;
