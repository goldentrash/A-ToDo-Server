import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type UserDTO } from "service";

type TokenPayload = {
  user_id: UserDTO["id"];
};

if (typeof process.env.JWT_SECRET !== "string")
  throw Error("there's no JWT_SECRET");
const JWT_SECRET = process.env.JWT_SECRET;

export default class UserDomain {
  private id: string;
  private hashed_password: string;

  constructor(userDTO: Pick<UserDTO, "id" | "hashed_password">) {
    this.id = userDTO.id;
    this.hashed_password = userDTO.hashed_password;
  }

  genToken(): string {
    const payload: TokenPayload = { user_id: this.id };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1 days" });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      throw createError(400, "Token Invalid");
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 5);
  }

  async verifyPassword(password: string): Promise<void> {
    const ret = await bcrypt.compare(password, this.hashed_password);
    if (!ret) throw createError(400, "Password Invalid");
  }
}
