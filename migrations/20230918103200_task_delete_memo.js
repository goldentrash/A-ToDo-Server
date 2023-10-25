/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) =>
  knex.schema.alterTable("task", (table) => {
    table.dropColumn("memo");
    table.string("content", 300).notNullable().alter();
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) =>
  knex.schema.alterTable("task", (table) => {
    table.string("memo", 200).notNullable().defaultTo("");
    table.string("content", 100).notNullable().alter();
  });
