const router = require('express').Router();
const {
  asyncHandlerWrapper,
  contentNegotiator,
  methodNotAllowedHandler,
} = require('./index');
const doing = require('../model/doing');

router
  .route('/')
  .post(
    contentNegotiator('json'),
    asyncHandlerWrapper(async (req, res, next) => {
      const { id } = req.body;
      await doing.add(id);
      return res.status(201).json({ message: 'doing Created' });
    })
  )
  .all(methodNotAllowedHandler(['POST']));

module.exports = router;
