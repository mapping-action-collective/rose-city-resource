module.exports = (app, pool) => {
  app.get("/api/query-staging", async (req, res, next) => {
    try {

      /* Pull the listing table and parse into JSON */
      await pool.query("SELECT * FROM etl_staging_1", async (error, queryResponse) => {
        if (error) {
          if (process.env.NODE_ENV == undefined || process.env.NODE_ENV !== "production") {
            try {
              await res.send(error);
            } catch (err) {
              console.error(err);
              res.sendStatus(500);
            }
          }
          return;
        }

        /* Return JSON to the client */
        await res.json(queryResponse.rows);

      });
    } catch (err) {
      return next(err);
    }
    
  });
};