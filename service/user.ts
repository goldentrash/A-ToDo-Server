import createError from "http-errors";
import { knex } from "repository";
import { UserDomain } from "domain/user";
import { type UserDAO } from "./type";

export type UserService = ReturnType<typeof genUserService>;

export const genUserService = (userRepo: UserDAO) => ({
  async signIn(id: string, password: string) {
    await userRepo.updateAccessTime(knex, id);

    const userDTO = await userRepo.find(knex, id);
    const user = new UserDomain(userDTO);

    await user.verifyPassword(password);
    return user.genToken();
  },
  async signUp(id: string, password: string) {
    const hashed_password = await UserDomain.hashPassword(password);
    return await userRepo.register(knex, { id, hashed_password });
  },
  async updateAccessTime(id: string) {
    return userRepo.updateAccessTime(knex, id);
  },
  verify(authorization: string) {
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") throw createError(401, "Token Not Supported");
    if (!token) throw createError(401, "Not Authorized");

    return UserDomain.verifyToken(token);
  },
});
