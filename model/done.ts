import { pool, createDatabaseError } from "model/index";

export default {
  add(id: string) {
    const sql = `INSERT INTO done(id) VALUES(?);`;

    return new Promise<void>((resolve, reject) => {
      pool.query(sql, [id], (err, _results, _fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve();
      });
    });
  },
};
