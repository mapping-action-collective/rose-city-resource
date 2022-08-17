const Airtable = require("airtable")
require("dotenv").config()

// This is the CURRENT test base as of 8/17/22 
// https://airtable.com/app1aef4m31bbo69J/tbl7pOb6TegGAmm4l/viwix17tvu8N8NA3K?blocks=hide
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app1aef4m31bbo69J')

// documentation: https://airtable.com/app1aef4m31bbo69J/api/docs#javascript/authentication

// phone table ID is tblq6FE6zx0PNfOHa
// listings table ID is tbl7pOb6TegGAmm4l

base("UPDATE THIS TABLE")
  .select({
    // Selecting the first 3 records in "Parent Orgs" Groups (Grid view):
    maxRecords: 3,
    view: '"Parent Orgs" Groups (Grid view)',
  })
  .eachPage(
    function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function (record) {
        console.log("Retrieved", record.get("asset_id"));
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
    },
    function done(err) {
      if (err) {
        console.error(err);
        return;
      }
    }
  );

  console.log('123')