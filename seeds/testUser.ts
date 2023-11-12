import { type Knex } from "knex";
import UserDomain from "../domains/user";

type UserData = {
  id: string;
  password: string;
};

export const testUserData: UserData = {
  id: "testuser",
  password: "password",
};

export const seed = async (knex: Knex): Promise<void> => {
  // Deletes ALL existing entries
  await knex("task").truncate();
  await knex("user").del();

  // Inserts seed entries
  const id = testUserData.id;
  const hashed_password = await UserDomain.hashPassword(testUserData.password);
  await knex("user").insert({ id, hashed_password });
};
