import createError from "http-errors";
import { knex } from "../repository";
import UserDomain, { type TokenPayload } from "../domain/user";
import { type UserDTO, type UserDAO } from "./type";

export type UserService = ReturnType<typeof genUserService>;

export const genUserService = (userRepo: UserDAO) => ({
  async signIn(id: UserDTO["id"], password: string): Promise<string> {
    await userRepo.updateAccessTime(knex, id);

    const userDTO = await userRepo.findById(knex, id);
    const user = new UserDomain(userDTO);

    await user.verifyPassword(password);
    return user.genToken();
  },

  async signUp(id: UserDTO["id"], password: string): Promise<void> {
    const hashed_password = await UserDomain.hashPassword(password);
    return await userRepo.insert(knex, { id, hashed_password });
  },

  async updateAccessTime(id: UserDTO["id"]): Promise<void> {
    return userRepo.updateAccessTime(knex, id);
  },

  verify(authorization: string): TokenPayload {
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") throw createError(401, "Token Not Supported");
    if (!token) throw createError(401, "Not Authorized");

    return UserDomain.verifyToken(token);
  },
});
