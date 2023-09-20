const bcrypt = require("bcrypt");

if (typeof process.env.SALT_ROUND != "string")
  throw Error("there's no SALT_ROUND");
const SALT_ROUND = parseInt(process.env.SALT_ROUND);

if (typeof process.env.NUM_OF_VUSER != "string")
  throw Error("there's no NUM_OF_VUSER");
const NUM_OF_VUSER = parseInt(process.env.NUM_OF_VUSER);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex("task").truncate();
  await knex("user").del();

  // make Virtual Users
  const hashed_password = bcrypt.hashSync("password", SALT_ROUND);
  const userIDs = [];
  for (let i = 1; i <= NUM_OF_VUSER; i++) userIDs.push(`user${i}`);
  await Promise.all(
    userIDs.map((id) => knex("user").insert({ id, hashed_password }))
  );
};
