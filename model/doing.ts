import { pool, createDatabaseError } from "model/index";

type Doing = {
  id: number;
  content: string;
  memo: string;
  deadline: string;
};
export default {
  getAll() {
    const sql = `
    SELECT
      id,
      content,
      memo,
      deadline
    FROM
      doing
      INNER JOIN todo USING(id)
    WHERE
      NOT EXISTS(
        SELECT
          id
        FROM
          done
        WHERE
          doing.id = done.id
      )
    ORDER BY
      deadline;`;

    return new Promise<Doing[]>((resolve, reject) => {
      pool.query(sql, (err, results, _fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve(results);
      });
    });
  },
  add(id: string) {
    const sql = `INSERT INTO doing(id) VALUES(?);`;

    return new Promise<void>((resolve, reject) => {
      pool.query(sql, [id], (err, _results, _fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve();
      });
    });
  },
  updateMemo(id: string, memo: string) {
    const sql = `UPDATE doing SET memo = ? WHERE id = ?;`;

    return new Promise<void>((resolve, reject) => {
      pool.query(sql, [memo, id], (err, _results, _fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve();
      });
    });
  },
};
