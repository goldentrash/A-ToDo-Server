export const NODE_ENV = process.env.NODE_ENV;

if (!process.env.PORT) throw Error("there's no PORT");
export const PORT = parseInt(process.env.PORT);

export const LOG_ROTATION_INTERVAL = "1d";
