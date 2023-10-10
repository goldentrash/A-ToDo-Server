import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { HttpError } from "http-errors";
import { knex, userRepo } from ".";

chai.use(chaiAsPromised);

describe("User Repository", function () {
  before(async function () {
    await knex("task").truncate();
  });

  beforeEach(async function () {
    await knex("user").del();
  });

  describe("Insert & Find", function () {
    it("생성한 유저는 조회 가능해야 함", async function () {
      // when
      await userRepo.insert(knex, {
        id: "testuser",
        hashed_password: "password",
      });

      // then
      expect(userRepo.findById(knex, "testuser")).to.eventually.deep.equal({
        id: "testuser",
        hashed_password: "password",
      });
    });

    it('ID가 너무 길면 "User Id Too Long"을 throw해야 함', async function () {
      // then
      expect(
        userRepo.insert(knex, {
          id: "toooooo long id",
          hashed_password: "password",
        })
      ).to.eventually.throw(HttpError, "User ID Too long");
    });

    it('중복된 ID면 "User ID Duplicated"를 throw해야 함', async function () {
      // when
      await userRepo.insert(knex, {
        id: "sameID",
        hashed_password: "password1",
      });

      // then
      expect(
        userRepo.insert(knex, {
          id: "sameID",
          hashed_password: "password2",
        })
      ).to.eventually.throw(HttpError, "User ID Duplicated");
    });

    it('생성 안 한 유저를 조회하면 "User Absent"를 throw해야 함', async function () {
      // when
      await userRepo.insert(knex, {
        id: "inserted",
        hashed_password: "password",
      });

      // then
      expect(userRepo.findById(knex, "notThat")).to.eventually.throw(
        HttpError,
        "User Absent"
      );
    });
  });

  describe("Update", function () {
    it("access time", async function () {
      // given
      await userRepo.insert(knex, {
        id: "testuser",
        hashed_password: "password",
      });

      // when
      await userRepo.updateAccessTime(knex, "testuser");

      // then
      const { last_accessed_at } = await userRepo.findById(knex, "testuser");
      expect(last_accessed_at).to.be.a("string");
    });

    it("push token", async function () {
      // given
      await userRepo.insert(knex, {
        id: "testuser",
        hashed_password: "password",
      });

      // when
      await userRepo.updatePushToken(knex, {
        id: "testuser",
        push_token: "push_token",
      });

      // then
      const { push_token } = await userRepo.findById(knex, "testuser");
      expect(push_token).to.equal("push_token");
    });
  });
});
