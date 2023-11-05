export const DB_POOL_MIN = 0;
export const DB_POOL_MAX = 7;

if (!process.env.DB_HOST) throw Error("there's no DB_HOST");
export const DB_HOST = process.env.DB_HOST;

if (!process.env.DB_PORT) throw Error("there's no DB_PORT");
export const DB_PORT = parseInt(process.env.DB_PORT);

if (!process.env.DB_USER) throw Error("there's no DB_USER");
export const DB_USER = process.env.DB_USER;

if (!process.env.DB_PASSWORD) throw Error("there's no DB_PASSWORD");
export const DB_PASSWORD = process.env.DB_PASSWORD;

if (!process.env.DB_NAME) throw Error("there's no DB_NAME");
export const DB_NAME = process.env.DB_NAME;
