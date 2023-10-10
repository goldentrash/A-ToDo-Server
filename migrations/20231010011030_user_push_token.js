/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) =>
  knex.schema.alterTable("user", (table) => {
    table.string("push_token", 4096);
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) =>
  knex.schema.alterTable("user", (table) => {
    table.dropColumn("push_token");
  });
