import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import UserDomain from "./user";
import { HttpError } from "http-errors";

chai.use(chaiAsPromised);

describe("access_token (JWT)", function () {
  it("User가 생성한 토큰은 인증 가능해야 함", function () {
    // given
    const user = new UserDomain({
      id: "testuser",
      hashed_password: "password",
    });

    // when
    const token = user.genToken();

    // then
    expect(() => UserDomain.verifyToken(token)).to.not.throw();
  });

  it('유효하지 않은 토큰은 "Token Invalid"를 throw해야 함', function () {
    // given
    const fakeToken = "faketoken";

    // then
    expect(() => UserDomain.verifyToken(fakeToken)).to.throw(
      HttpError,
      "Token Invalid"
    );
  });

  it("토큰 payload의 user_id는 토큰을 생성한 User의 id여야 함", function () {
    // given
    const user = new UserDomain({
      id: "testuser",
      hashed_password: "password",
    });

    // when
    const token = user.genToken();

    // then
    expect(UserDomain.verifyToken(token).user_id).to.equal("testuser");
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
    expect(user.verifyPassword("password")).to.eventually.not.throw();
  });

  it('원본과 다른 password로 인증 시도시 "Password Invalid"를 throw해야 함', async function () {
    // when
    const user = new UserDomain({
      id: "testuser",
      hashed_password: await UserDomain.hashPassword("password"),
    });

    // then
    expect(user.verifyPassword("fakepassword")).to.eventually.throw(
      HttpError,
      "Password Invalid"
    );
  });
});
