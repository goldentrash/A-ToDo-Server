import { type Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable("user", (table) => {
    table.string("push_token", 4096);
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable("user", (table) => {
    table.dropColumn("push_token");
  });
