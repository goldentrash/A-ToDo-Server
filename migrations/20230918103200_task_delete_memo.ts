import { type Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable("task", (table) => {
    table.dropColumn("memo");
    table.string("content", 300).notNullable().alter();
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable("task", (table) => {
    table.string("memo", 200).notNullable().defaultTo("");
    table.string("content", 100).notNullable().alter();
  });
