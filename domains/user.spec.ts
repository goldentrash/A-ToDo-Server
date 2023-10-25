import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { HttpError } from "http-errors";
import UserDomain from "./user";

chai.use(chaiAsPromised);

describe("User Domain", function () {
  describe("access_token (JWT)", function () {
    it("유저가 생성한 토큰은 인증 가능해야 함", function () {
      // given
      const user = new UserDomain({
        id: "testuser",
        hashed_password: "password",
      });

      // when
      const token = user.genToken();

      // then
      expect(UserDomain.extractTokenPayload(token)).to.eventually.not.throw();
    });

    it('유효하지 않은 토큰은 "Token Invalid"를 throw해야 함', function () {
      // given
      const fakeToken = "faketoken";

      // then
      expect(UserDomain.extractTokenPayload(fakeToken)).to.eventually.throw(
        HttpError,
        "Token Invalid"
      );
    });

    it("토큰 payload의 user_id는 토큰을 생성한 유저의 id여야 함", async function () {
      // given
      const user = new UserDomain({
        id: "testuser",
        hashed_password: "password",
      });

      // when
      const token = user.genToken();

      // then
      const payload = await UserDomain.extractTokenPayload(token);
      expect(payload.user_id).to.equal("testuser");
    });
  });

  describe("password hashing", function () {
    it("password 원본으로 인증이 가능해야 함", async function () {
      // when
      const user = new UserDomain({
        id: "testuser",
        hashed_password: await UserDomain.hashPassword("password"),
      });

      // then
      expect(await user.verifyPassword("password")).to.be.true;
    });

    it("원본과 다른 password로 인증이 불가능해야 함", async function () {
      // when
      const user = new UserDomain({
        id: "testuser",
        hashed_password: await UserDomain.hashPassword("password"),
      });

      // then
      expect(await user.verifyPassword("fakepassword")).to.be.false;
    });
  });
});
