import createError from "http-errors";
import { knex, userRepo } from "../repositories";
import UserDomain from "../domains/user";
import { type UserDTO } from "./type";

export const userService = {
  async signIn(id: UserDTO["id"], password: string): Promise<string> {
    const userDTO = await userRepo.findById(knex, id);
    const user = new UserDomain(userDTO);

    if ((await user.verifyPassword(password)) === false)
      throw createError(400, "Password Invalid");

    return user.genToken();
  },

  async signUp(id: UserDTO["id"], password: string): Promise<void> {
    const hashed_password = await UserDomain.hashPassword(password);
    return await userRepo.insert(knex, { id, hashed_password });
  },

  async updateAccessTime(id: UserDTO["id"]): Promise<void> {
    return userRepo.updateAccessTime(knex, id);
  },

  async verify(authorization: string): Promise<UserDTO["id"]> {
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") throw createError(401, "Token Not Supported");
    if (!token) throw createError(401, "Not Authorized");

    const tokenPayload = await UserDomain.extractTokenPayload(token);
    return tokenPayload.user_id;
  },

  async updatePushToken({
    id,
    push_token,
  }: Pick<UserDTO, "id" | "push_token">): Promise<void> {
    await userRepo.updatePushToken(knex, { id, push_token });
  },
};
