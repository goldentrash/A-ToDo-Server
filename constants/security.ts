export const SALT_ROUND = 5;

if (!process.env.JWT_SECRET) throw Error("there's no JWT_SECRET");
export const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.JWT_EXP) throw Error("there's no JWT_EXP");
export const JWT_EXP = process.env.JWT_EXP;
