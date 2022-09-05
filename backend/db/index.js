/*
  This is the * only * database connection.
  All other files should import and use these functions
  for any database calls.
*/

const { Pool } = require("pg");
require("dotenv").config();

// Heroku free postgres allows up to 20 concurrent connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // connectionString: process.env.HEROKU_POSTGRESQL_YELLOW_URL,
  max: 20,
  ssl: {rejectUnauthorized: false},
});

// Error handling
pool.on("error", (error, client) => {
  if (
    process.env.NODE_ENV === undefined ||
    process.env.NODE_ENV !== "production"
  ) {
    console.error(
      `Database pool error: ${error}; Connection string: ${process.env.DATABASE_URL}`
    );
  }
});

// Sanity check for devs that will alert you if you're missing the database connection string
(() => {
  pool.query(`SELECT * FROM production_meta`, (err, res) => {
    if (res) console.log("Connected to Heroku Postgres");
    if (err) {
      console.error("Error connnecting to the database!");
      if (
        process.env.DATABASE_URL === undefined ||
        process.env.DATABASE_URL === null ||
        process.env.DATABASE_URL === ""
      ) {
        console.error(
          "Please check that the DATABASE_URL environment variable is correct"
        );
      }
    }
  });
})();

module.exports = {
  query: (text, params) => pool.query(text, params),

  callbackQuery: (text, params, callback) => pool.query(text, params, callback),

  // For debugging
  queryWithLogging: async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("executed query", {text, duration, rows: res.rowCount});
    return res;
  },

  pool: pool,
};
