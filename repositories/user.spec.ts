import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { HttpError } from "http-errors";
import { knex, userRepo } from ".";
import { seed } from "../seeds/clear";

chai.use(chaiAsPromised);

describe("User Repository", function () {
  beforeEach(async function () {
    await seed(knex);
  });

  describe("Insert & Find", function () {
    it("생성한 유저는 조회 가능해야 함", async function () {
      // given
      const newUserData: Parameters<typeof userRepo.insert>[1] = {
        id: "testuser",
        hashed_password: "password",
      };

      // when
      await userRepo.insert(knex, newUserData);

      // then
      return expect(
        userRepo.findById(knex, newUserData.id)
      ).to.eventually.deep.include(newUserData);
    });

    it('ID가 너무 길면 "User Id Too Long"을 throw해야 함', function () {
      // given
      const tooLongIdUserData: Parameters<typeof userRepo.insert>[1] = {
        id: "toooooo long id",
        hashed_password: "password",
      };

      // when

      // then
      return expect(
        userRepo.insert(knex, tooLongIdUserData)
      ).to.eventually.be.rejectedWith(HttpError, "User ID Too Long");
    });

    it('중복된 ID면 "User ID Duplicated"를 throw해야 함', async function () {
      // given
      const insertedUserData: Parameters<typeof userRepo.insert>[1] = {
        id: "sameID",
        hashed_password: "password",
      };
      const sameIdUserData: Parameters<typeof userRepo.insert>[1] = {
        id: "sameID",
        hashed_password: "password",
      };

      // when
      await userRepo.insert(knex, insertedUserData);

      // then
      return expect(
        userRepo.insert(knex, sameIdUserData)
      ).to.eventually.be.rejectedWith(HttpError, "User ID Duplicated");
    });

    it('생성 안 한 유저를 조회하면 "User Absent"를 throw해야 함', async function () {
      // given
      const insertedUserData: Parameters<typeof userRepo.insert>[1] = {
        id: "inserted",
        hashed_password: "password",
      };
      const notInsertedUserData: Parameters<typeof userRepo.insert>[1] = {
        id: "notThat",
        hashed_password: "password",
      };

      // when
      await userRepo.insert(knex, insertedUserData);

      // then
      return expect(
        userRepo.findById(knex, notInsertedUserData.id)
      ).to.eventually.be.rejectedWith(HttpError, "User Absent");
    });
  });

  describe("Update", function () {
    it("생성한 유저는 push token을 수정 가능해야 함", async function () {
      // given
      const userData: Parameters<typeof userRepo.insert>[1] = {
        id: "testuser",
        hashed_password: "password",
      };
      await userRepo.insert(knex, userData);

      // when
      const newPushToken = "new push_token";
      await userRepo.updatePushToken(knex, {
        id: userData.id,
        push_token: newPushToken,
      });

      // then
      return expect(
        userRepo.findById(knex, userData.id)
      ).to.eventually.deep.include({
        push_token: newPushToken,
      });
    });
  });
});
