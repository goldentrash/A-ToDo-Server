const { pool, createDatabaseError } = require('./index');

const todo = {
  get() {
    const sql = `SELECT id, content, deadline FROM todo;`;

    return new Promise((resolve, reject) => {
      pool.query(sql, (err, results, fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve(results);
      });
    });
  },
  add(content, deadline) {
    const sql = `INSERT INTO todo(content, deadline) VALUES(?, ?);`;

    return new Promise((resolve, reject) => {
      pool.query(sql, [content, deadline], (err, results, fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve();
      });
    });
  },
};

module.exports = todo;
