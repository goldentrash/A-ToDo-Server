import mysql from 'mysql';
import createError from 'http-errors';
import type { MysqlError } from 'mysql';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'a_todo',
});

const userErrors: MysqlError['code'][] = [
  'ER_DUP_ENTRY',
  'ER_NO_REFERENCED_ROW_2',
  'ER_TRUNCATED_WRONG_VALUE',
  'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD',
  'ER_BAD_NULL_ERROR',
];

export const createDatabaseError = (err: MysqlError) =>
  userErrors.includes(err.code)
    ? createError(400, 'Bad Request')
    : createError(500, 'database error');
