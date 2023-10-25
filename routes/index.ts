import type { Request, Response, NextFunction } from "express";

export const asyncHandlerWrapper = (
  asyncRouteHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncRouteHandler(req, res, next);
    } catch (err) {
      return next(err);
    }
  };
};

type ContentType = "json";
export const genContentNegotiator =
  (contentTypes: ContentType[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.accepts(contentTypes))
      return res.status(406).json({
        message: "Not Acceptable",
        acceptables: contentTypes,
      });
    else return next();
  };

type HttpMethod = "GET" | "POST" | "PUT";
export const genMethodNotAllowedHandler =
  (allowedMethods: HttpMethod[]) =>
  (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(406).set("Allow", allowedMethods.join(", ")).json({
      message: "Method Not Allowed",
    });
  };
