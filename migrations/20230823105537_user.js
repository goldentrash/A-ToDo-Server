/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) =>
  knex.schema.createTable("user", (table) => {
    table.engine("InnoDB");
    table.string("id", 10).primary();
    table.specificType("hashed_password", "char(60)").notNullable();
    table.timestamp("registerd_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("last_accessed_at").notNullable().defaultTo(knex.fn.now());
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => knex.schema.dropTableIfExists("user");
