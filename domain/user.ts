import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type UserDTO } from "../service";

export type TokenPayload = {
  user_id: UserDTO["id"];
};

if (typeof process.env.JWT_SECRET !== "string")
  throw Error("there's no JWT_SECRET");
const JWT_SECRET = process.env.JWT_SECRET;

if (typeof process.env.SALT_ROUND !== "string")
  throw Error("there's no SALT_ROUND");
const SALT_ROUND = parseInt(process.env.SALT_ROUND);

if (typeof process.env.JWT_EXP !== "string") throw Error("there's no JWT_EXP");
const JWT_EXP = process.env.JWT_EXP;

export default class UserDomain {
  private id: string;
  private hashed_password: string;

  constructor(userDTO: Pick<UserDTO, "id" | "hashed_password">) {
    this.id = userDTO.id;
    this.hashed_password = userDTO.hashed_password;
  }

  genToken(): string {
    const payload: TokenPayload = { user_id: this.id };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      throw createError(400, "Token Invalid");
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUND);
  }

  async verifyPassword(password: string): Promise<void> {
    const ret = await bcrypt.compare(password, this.hashed_password);
    if (!ret) throw createError(400, "Password Invalid");
  }
}
