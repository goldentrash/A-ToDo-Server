import Knex from "knex";
import * as config from "../knexfile";

export const knex = Knex(config);

export { userRepo } from "./user";
export { taskRepo } from "./task";
