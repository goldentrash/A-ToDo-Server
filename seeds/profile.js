const bcrypt = require("bcrypt");
const hashed_password = bcrypt.hashSync(
  "password",
  parseInt(process.env.SALT_ROUND)
);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex("task").truncate();
  await knex("user").del();

  for (let i = 1; i <= parseInt(process.env.NUM_OF_VUSER); i++)
    await knex("user").insert({
      id: `user${i}`,
      hashed_password,
    });
};
