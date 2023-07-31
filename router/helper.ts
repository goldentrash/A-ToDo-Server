import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";

export const asyncHandlerWrapper = (
  asyncRouteHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response>
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
        error: "Not Acceptable",
        acceptables: contentTypes,
      });
    else return next();
  };

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH";
export const genMethodNotAllowedHandler =
  (allowedMethods: HttpMethod[]) =>
  (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(406).set("Allow", allowedMethods.join(", ")).json({
      error: "Method Not Allowed",
    });
  };

export const userAuthenticator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [type, token] = req.get("Authorization")?.split(" ") ?? [];
  if (type !== "Bearer") return next(createError(401, "Token Not Supported"));
  if (!token) return next(createError(401, "Not Authorized"));

  try {
    const payload = jwt.verify(
      token,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;
    res.locals.user_id = payload.userId;
  } catch {
    return next(createError(401, "Token Invalid"));
  }

  return next();
};
