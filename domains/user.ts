import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type UserDTO } from "../services";
import { JWT_EXP, JWT_SECRET, SALT_ROUND } from "../constants";

export type TokenPayload = {
  user_id: UserDTO["id"];
};

export default class UserDomain {
  private id: string;
  private hashed_password: string;

  constructor({
    id,
    hashed_password,
  }: Pick<UserDTO, "id" | "hashed_password">) {
    this.id = id;
    this.hashed_password = hashed_password;
  }

  genToken(): string {
    const payload: TokenPayload = { user_id: this.id };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });
  }

  static extractTokenPayload(token: string): Promise<TokenPayload> {
    return new Promise<TokenPayload>((resolve, reject) =>
      jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (!err) return resolve(payload as TokenPayload);

        if (err.name === "TokenExpiredError")
          return reject(createError(400, "Token Expired"));

        if (err.name === "JsonWebTokenError")
          return reject(createError(400, "Token Invalid"));

        return reject(err);
      })
    );
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUND);
  }

  async verifyPassword(password: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(password, this.hashed_password, (err, result) => {
        if (!err) return resolve(result);
        return reject(err);
      });
    });
  }
}
