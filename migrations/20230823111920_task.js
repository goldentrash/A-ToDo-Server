/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) =>
  knex.schema.createTable("task", (table) => {
    table.engine("InnoDB");
    table.increments("id");
    table.string("user_id", 10).notNullable().references("id").inTable("user");
    table
      .specificType("progress", `ENUM ('todo', 'doing', 'done')`)
      .notNullable();
    table
      .specificType(
        "for_unique_doing_per_user",
        `VARCHAR(10) GENERATED ALWAYS AS (
          CASE
            WHEN progress = 'doing' THEN user_id
          END
        ) VIRTUAL`
      )
      .unique();
    table.string("content", 100).notNullable();
    table.string("memo", 200).notNullable().defaultTo("");
    table.date("deadline").notNullable(); // must match DB timezon
    table.timestamp("registerd_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("started_at");
    table.timestamp("finished_at");
    table.check(
      `progress = 'todo'
        OR started_at IS NOT NULL`
    );
    table.check(
      `progress <> 'done'
        OR finished_at IS NOT NULL`
    );
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => knex.schema.dropTableIfExists("task");
