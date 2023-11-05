import { type Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.createTable("user", (table) => {
    table.engine("InnoDB");
    table.string("id", 10).primary();
    table.specificType("hashed_password", "char(60)").notNullable();
    table.timestamp("registerd_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("last_accessed_at").notNullable().defaultTo(knex.fn.now());
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.dropTableIfExists("user");
