import { type Knex } from "knex";
import { createWriteStream } from "node:fs";
import path from "path";
import UserDomain from "../domains/user";

if (!process.env.NUM_OF_VUSER) throw Error("there's no NUM_OF_VUSER");
const NUM_OF_VUSER = parseInt(process.env.NUM_OF_VUSER);

if (!process.env.CSV_OF_VUSER) throw Error("there's no CSV_OF_VUSER");
const CSV_OF_VUSER = path.join(__dirname, "..", process.env.CSV_OF_VUSER);

export const seed = async (knex: Knex): Promise<void> => {
  // Deletes ALL existing entries
  await knex("task").truncate();
  await knex("user").del();

  // Inserts seed entries
  const csvStream = createWriteStream(CSV_OF_VUSER);
  for (let i = 0; i < NUM_OF_VUSER; i++) {
    const id = `user${i}`;
    const password = `password${i}`;
    const hashed_password = await UserDomain.hashPassword(password);

    csvStream.write(`${id},${password}\n`);
    await knex("user").insert({ id, hashed_password });
  }
};
