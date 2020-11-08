const keys = require("../config/nodeKeys")
const { Client } = require('pg');

module.exports = (app, pool) => {
  app.get("/api/last-update", async (req, res) => {

    /* Pull the listing table and parse into JSON */
    await pool.query("SELECT last_update FROM production_meta", async (sqlerr, sqlres) => {
      if (sqlerr) {
        if (process.env.NODE_ENV == undefined || process.env.NODE_ENV !== "production") {
          try {
            await res.send(sqlerr);
          } catch (e) {
            console.log(e);
          }
        }
        return;
      }

      /* Return JSON to the client */
      try {
        await res.json(sqlres.rows[0]['last_update']);
      } catch (e) {
        console.log(e);
      }

    });
  });
};