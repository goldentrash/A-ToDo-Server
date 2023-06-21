const { pool, createDatabaseError } = require('./index');

const done = {
  add(id, memo) {
    const sql = `INSERT INTO done(id, memo) VALUES(?, ?);`;

    return new Promise((resolve, reject) => {
      pool.query(sql, [id, memo], (err, results, fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve();
      });
    });
  },
};

module.exports = done;
