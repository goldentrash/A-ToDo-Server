import createError from "http-errors";
import { pool } from "repository";
import { UserDomain } from "domain/user";
import { type UserDAO } from "./type";

export type UserService = ReturnType<typeof genUserService>;

export const genUserService = (userRepo: UserDAO) => ({
  async signIn(id: string, password: string) {
    const conn = await pool.getConnection();

    try {
      await userRepo.updateAccessTime(conn, id);

      const userDTO = await userRepo.find(conn, id);
      const user = new UserDomain(userDTO);

      await user.verifyPassword(password);
      const token = user.genToken();
      return token;
    } finally {
      conn.release();
    }
  },
  async signUp(id: string, password: string) {
    const conn = await pool.getConnection();

    try {
      const hashed_password = await UserDomain.hashPassword(password);
      await userRepo.register(conn, { id, hashed_password });

      return;
    } finally {
      conn.release();
    }
  },
  async updateAccessTime(id: string) {
    const conn = await pool.getConnection();

    try {
      userRepo.updateAccessTime(conn, id);
      return;
    } finally {
      conn.release();
    }
  },
  verify(authorization: string) {
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") throw createError(401, "Token Not Supported");
    if (!token) throw createError(401, "Not Authorized");

    return UserDomain.verifyToken(token);
  },
});
