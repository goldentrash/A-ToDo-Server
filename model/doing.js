const { pool, createDatabaseError } = require('./index');

const doing = {
  get() {
    const sql = `
    SELECT id, content, deadline 
    FROM doing 
      INNER JOIN todo USING(id)
    WHERE NOT EXISTS(
      SELECT id FROM done WHERE doing.id = done.id
    );`;

    return new Promise((resolve, reject) => {
      pool.query(sql, (err, results, fields) => {
        if (err) return reject(createDatabaseError(err));

        return resolve(results);
      });
    });
  },
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
