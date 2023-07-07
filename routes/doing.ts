import express from 'express';
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from 'routes/index';
import doing from 'model/doing';

const router = express.Router();

router
  .route('/')
  .get(
    genContentNegotiator(['json']),
    asyncHandlerWrapper(async (_req, res, _next) => {
      return res
        .status(200)
        .json({ message: 'Query Accepted', data: await doing.getAll() });
    })
  )
  .post(
    genContentNegotiator(['json']),
    asyncHandlerWrapper(async (req, res, _next) => {
      const { id } = req.body;
      await doing.add(id);
      return res.status(201).json({ message: 'doing Created' });
    })
  )
  .all(genMethodNotAllowedHandler(['GET', 'POST']));

router
  .route('/:id/memos')
  .put(
    genContentNegotiator(['json']),
    asyncHandlerWrapper(async (req, res, next) => {
      const { id } = req.params;
      const { memo } = req.body;
      await doing.updateMemo(id, memo);
      return res.status(200).json({ message: 'memo Updated' });
    })
  )
  .all(genMethodNotAllowedHandler(['PUT']));

export default router;
