const { pool, createDatabaseError } = require('./index');

const doing = {
  add(id) {
    const sql = `INSERT INTO doing(id) VALUES(?);`;

    return new Promise((resolve, reject) => {
      pool.query(sql, [id], (err, results, fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve();
      });
    });
  },
};

module.exports = doing;
