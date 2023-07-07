import { pool, createDatabaseError } from 'model/index';

type Todo = {
  id: number;
  content: string;
  deadline: string;
};
export default {
  getAll() {
    const sql = `
    SELECT
      id,
      content,
      deadline
    FROM
      todo
    WHERE
      NOT EXISTS(
        SELECT
          id
        FROM
          doing
        WHERE
          doing.id = todo.id
      )
    ORDER BY
      deadline;`;

    return new Promise<Todo[]>((resolve, reject) => {
      pool.query(sql, (err, results, _fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve(results);
      });
    });
  },
  add(content: string, deadline: string) {
    const sql = `INSERT INTO todo(content, deadline) VALUES(?, ?);`;

    return new Promise<void>((resolve, reject) => {
      pool.query(sql, [content, deadline], (err, _results, _fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve();
      });
    });
  },
};
