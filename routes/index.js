exports.asyncHandlerWrapper = (asyncRouteHandler) => {
  return async (req, res, next) => {
    try {
      return await asyncRouteHandler(req, res, next);
    } catch (err) {
      return next(err);
    }
  };
};

exports.contentNegotiator = (contentTypes) => (req, res, next) => {
  if (!req.accepts(contentTypes))
    return res.status(406).json({
      message: 'Not Acceptable',
      acceptables: contentTypes,
    });
  else return next();
};

exports.methodNotAllowedHandler = (allowedMethods) => (req, res, next) => {
  return res.status(406).set('Allow', allowedMethods.join(', ')).json({
    message: 'Method Not Allowed',
  });
};
