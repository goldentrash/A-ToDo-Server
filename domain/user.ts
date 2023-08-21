import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type UserDTO } from "service";

type TokenPayload = {
  user_id: UserDTO["id"];
};

export class UserDomain {
  private id: string;
  private hashed_password: string;

  constructor(userDTO: UserDTO) {
    this.id = userDTO.id;
    this.hashed_password = userDTO.hashed_password;
  }

  genToken() {
    const payload: TokenPayload = { user_id: this.id };

    return jwt.sign(
      payload,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.JWT_SECRET!,
      { expiresIn: "1 days" }
    );
  }

  async verifyPassword(password: string) {
    const ret = await bcrypt.compare(password, this.hashed_password);
    if (!ret) throw createError(400, "Password Invalid");
  }

  static async hashPassword(password: string) {
    return await bcrypt.hash(password, 5);
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(
        token,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.JWT_SECRET!
      ) as TokenPayload;
    } catch {
      throw createError(400, "Token Invalid");
    }
  }
}
