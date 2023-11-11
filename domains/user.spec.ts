import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import UserDomain from "./user";

chai.use(chaiAsPromised);

type UserData = ConstructorParameters<typeof UserDomain>[0] & {
  password: string;
};

describe("User Domain", function () {
  describe("access_token (JWT)", function () {
    it("생성한 토큰은 유저 ID를 포함해야 함", async function () {
      // given
      const testUserData: UserData = {
        id: "testuser",
        password: "password",
        hashed_password: await UserDomain.hashPassword("password"),
      };

      // when
      const testUser = new UserDomain(testUserData);
      const token = testUser.genToken();

      // then
      return expect(
        UserDomain.extractTokenPayload(token)
      ).to.eventually.deep.include({ user_id: testUserData.id });
    });
  });

  describe("password hashing", function () {
    it("정확한 password로 인증이 가능해야 함", async function () {
      // given
      const testUserData: UserData = {
        id: "testuser",
        password: "password",
        hashed_password: await UserDomain.hashPassword("password"),
      };

      // when
      const testUser = new UserDomain(testUserData);

      // then
      return expect(testUser.verifyPassword(testUserData.password)).to
        .eventually.be.true;
    });

    it("부정확한 password로 인증이 불가능해야 함", async function () {
      // given
      const testUserData: UserData = {
        id: "testuser",
        password: "password",
        hashed_password: await UserDomain.hashPassword("password"),
      };
      const fakeUserData: UserData = {
        id: "fakeuser",
        password: "fakepassword",
        hashed_password: await UserDomain.hashPassword("fakepassword"),
      };

      // when
      const testUser = new UserDomain(testUserData);

      // then
      return expect(testUser.verifyPassword(fakeUserData.password)).to
        .eventually.be.false;
    });
  });
});
