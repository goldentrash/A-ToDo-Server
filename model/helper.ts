import createError from "http-errors";

// check constraint 박살나면 어떤 에러인지 확인 필요
// mysql2로 이주할 계획 (async style)
// 동일한 에러인지도 확인 필요
const userErrors: MysqlError["code"][] = [
  "ER_DUP_ENTRY",
  "ER_NO_REFERENCED_ROW_2",
  "ER_TRUNCATED_WRONG_VALUE",
  "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD",
  "ER_BAD_NULL_ERROR",
];

export const createDatabaseError = (err: MysqlError) =>
  userErrors.includes(err.code)
    ? createError(400, "Bad Request")
    : createError(500, "database error");
