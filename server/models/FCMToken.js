const db = require("../db");

const FCMToken = {
  insert: async (token) => {
    const sql = `INSERT IGNORE INTO fcm_tokens (token) VALUES (?)`;
    const [result] = await db.query(sql, [token]);
    return result;
  },

  getAll: async () => {
    const sql = `SELECT * FROM fcm_tokens`;
    const [rows] = await db.query(sql);
    return rows;
  },
};

module.exports = FCMToken;
