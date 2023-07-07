import express from 'express';
import {
  asyncHandlerWrapper,
  genContentNegotiator,
  genMethodNotAllowedHandler,
} from 'routes/index';
import done from 'model/done';

const router = express.Router();

router
  .route('/')
  .post(
    genContentNegotiator(['json']),
    asyncHandlerWrapper(async (req, res, _next) => {
      const { id } = req.body;
      await done.add(id);
      return res.status(201).json({ message: 'done Created' });
    })
  )
  .all(genMethodNotAllowedHandler(['POST']));

export default router;
