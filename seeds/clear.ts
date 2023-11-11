import { type Knex } from "knex";

export const seed = async (knex: Knex): Promise<void> => {
  // Deletes ALL existing entries
  await knex("task").truncate();
  await knex("user").del();
};
