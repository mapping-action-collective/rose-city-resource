require('dotenv').config();
const keys = require("../config/nodeKeys");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const { Pool } = require('pg');
const app = express();
app.disable('x-powered-by');

/* Determine whether the Node.js environment is development or production */
const isProdEnvironment = process.env.NODE_ENV === "production";
const isDevEnvironment = process.env.NODE_ENV === undefined || process.env.NODE_ENV !== "production";

/* Heroku free postgres allows up to 20 concurrent connections */
const pool = new Pool({
  connectionString: keys.DATABASE_URL,
  max: 20,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', async (error, client) => {
  if (isDevEnvironment) {
    console.error(`Database pool error: ${error}; Connection string: ${keys.DATABASE_URL}`);
  }
});

/* Middleware */
app.use(compression({ filter: shouldCompress }))
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}
app.use(cors());
app.use(helmet.hidePoweredBy({ setTo: 'Blood, Sweat and Tears' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(function(req, res, next) {
  /* Add Cache-Control headers to all requests */
  const expireAfterMinutes = 60;
  const cacheControlHeaderValue = isProdEnvironment
    ? `public, max-age=${expireAfterMinutes/2 * 60}, stale-while-revalidate=${expireAfterMinutes/2 * 60}`
    : `no-cache`
  res.header('Cache-Control', cacheControlHeaderValue);
  next();
});

/* Routes */
require("./routes/query")(app, pool);
require("./routes/query-staging")(app, pool);
require("./routes/meta-information")(app, pool);
require("./routes/admin")(app, pool);

/* Check for database connectivity and provide a human-friendly message on failure */
const testDatabaseQuery = async () => {
  // const response = await pool.query(`SELECT * FROM preview_listings`)
  // const response = await pool.query(CREATE_PREVIEW_TABLE);
  // if (response) {
  //   console.log(response.rows[0])
  // }

  // pool.query(`select last_update from production_meta`, (err, res) => {
  //   if (err) {
  //     console.error('Error connnecting to the database!');
  //     if (keys.TEMP_DATABASE_URL_TESTING_ONLY === undefined || keys.TEMP_DATABASE_URL_TESTING_ONLY === null || keys.TEMP_DATABASE_URL_TESTING_ONLY === '') {
  //       console.error('Please check that the TEMP_DATABASE_URL_TESTING_ONLY environment variable is correct. See comments in nodeKeys.js for further information.');
  //     }
  //   }
  // });
}
testDatabaseQuery();

/* Default handler for requests not handled by one of the above routes */
if (process.env.NODE_ENV === "production") {
  const frontEndPath = path.join(__dirname, "/../frontend/build");
  const staticOptions = {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html'))
        res.setHeader('Cache-Control', 'no-cache'); /* ALWAYS re-validate HTML files! */
      else
        res.header('Cache-Control', `max-age=31536000`); /* Aggressively cache other static content */
    }
  }
  app.use(express.static(frontEndPath, staticOptions))
  app.use("*", express.static(frontEndPath, staticOptions))
}

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`SERVER IS RUNNING ON PORT ${PORT}`)

const Airtable = require("airtable");
const { create } = require('domain');
require("dotenv").config();

// This is the CURRENT test base as of 8/17/22
// https://airtable.com/app1aef4m31bbo69J/tbl7pOb6TegGAmm4l/viwix17tvu8N8NA3K?blocks=hide
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(
  "app1aef4m31bbo69J"
);

const DATABASE_FIELDS = [
  'general_category',
  'main_category',
  'parent_organization',
  'listing',
  'service_description',
  'covid_message',
  'street',
  'street2',
  'city',
  'postal_code',
  'website',
  'hours',
  'lat',
  'lon',
  'phone',
  'asset_id',
];

const FIELDS = [
  "general_category",
  "main_category",
  "parent_organization",
  "listing",
  "service_description",
  "covid_message",
  "street",
  "street2",
  "city",
  "postal_code",
  "website",
  "hours",
  "lat",
  "lon",
  "phone_1",
  "phone_1_label",
  "phone_2",
  "phone_2_label",
  "phone_3",
  "phone_3_label",
  "asset_id",
];

const formatListing = (result) => {
  let listing = {};
  const fields = result.fields;
  Object.keys(fields).map((field) => {
    if (FIELDS.includes(field)) {
      listing[field] = fields[field];
    }
  });
  listing = formatId(listing);
  listing = formatPhone(listing);
  return listing;
}

async function runAirtableEtl() {
  try {
    base("CURRENT DATA")
      // .select({view: "Clean Data", maxRecords: 4})
      .select({view: "Clean Data"})
      .all()
      .then((results) => {
        // Write results to Postgres
        (async() => {
          const client = await pool.connect();
          try {
            results.forEach((result) => {
              let listing = formatListing(result);
              if (listing.id > 112) {
              (async() => {
                await writeListingToPreview(listing, client);
                // client.release();
              })()
              }
            });
          } catch (error) {
            console.log('error in ELT catch', error.message);
            return;
          } 
        })();
      })
      .catch((err) => console.error(err));
  } catch (error) {
    console.log(error)
    return;
  }
}



// runAirtableEtl();

// The API expects "phone" to be a single string that includes all phone labels and numbers, separated by commas
// Example string: "Main Line:(503)555-5555,Crisis Line:800-424-1325"
const formatPhone = (record) => {
  let phoneString = '';
  if (record.phone_1_label) {
    phoneString += record.phone_1_label + ':';
  }
  if (record.phone_1) {
    phoneString += record.phone_1 + ',';
  }
  if (record.phone_2_label) {
    phoneString += record.phone_2_label + ":";
  }
  if (record.phone_2) {
    phoneString += record.phone_2 + ",";
  }
  if (record.phone_3_label) {
    phoneString += record.phone_3_label + ":";
  }
  if (record.phone_3) {
    phoneString += record.phone_3 + ",";
  }
  // Remove final comma to work around FE formatting
  phoneString = phoneString.slice(0, -1)
  record.phone = phoneString;
  return record;
}

const formatId = record => {
  record.id = record.asset_id;
  return record;
}

// airtable DOCUMENTATION FOUND HERE: documentation: https://airtable.com/app1aef4m31bbo69J/api/docs#javascript/authentication

// DATA TABLE FIELDS FOR REFERENCE ONLY ----------------------------
// general_category, main_category, parent_organization, listing, 
// service_ description, covid_message, street, street2, city, 
// postal_code, website, hours, phone, id  

// SQL helper strings ----------------------------------------

const DROP_PREVIEW_TABLE = `DROP TABLE IF EXISTS preview_data`;

const CREATE_PREVIEW_TABLE = `
  CREATE TABLE IF NOT EXISTS rcr_preview_data (
    general_category TEXT,
    main_category TEXT,  
    parent_organization TEXT,
    listing TEXT,
    service_description TEXT, 
    covid_message TEXT,
    street TEXT,
    street2 TEXT,
    city TEXT,
    postal_code TEXT,
    county TEXT,
    website TEXT,
    hours TEXT,
    phone TEXT,
    lat TEXT,
    lon TEXT,
    id INT PRIMARY KEY NOT NULL
  );
`;
const CREATE_PRODUCTION_TABLE = `
  CREATE TABLE production_data AS SELECT * FROM preview_data;
`

const INSERT_INTO_PREVIEW_TABLE = `
  INSERT INTO rcr_preview_data (
    general_category, main_category, parent_organization, listing, 
    service_description, covid_message, street, street2, city, 
    postal_code, website, hours, phone, id, lat, lon, county) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  RETURNING *;
`;

const writeListingToPreview = async (record, client) => {
  try {
    const general_category = record.general_category ?? ""
    const main_category = record.main_category ?? "";

    const parent_organization = record.parent_organization ?? "";
    const listing = record.listing ?? "";
    const service_description = record.service_description ?? "";
    const covid_message = record.covid_message ?? "";
    const street = record.street ?? "";
    const street2 = record.street2 ?? "";
    const city = record.city ?? "";
    const postal_code = record.postal_code ?? "";
    const website = record.website ?? "";
    const hours = record.hours ?? "";
    const phone = record.phone ?? "";
    const id = record.id ?? "";
    const lat = record.lat ?? "";
    const lon = record.lon ?? "";
    const county = record.county ?? "";
    // const { general_category, main_category, parent_organization, listing, 
    //   service_description, covid_message, street, street2, city, 
    //   postal_code, website, hours, phone, id, lat, lon  
    // } = record ?? "";

    // const response = await pool.query(
    //   `INSERT INTO rcr_preview_data (
    //     general_category, main_category, parent_organization, listing, 
    //     service_description, covid_message, street, street2, city, 
    //     postal_code, website, hours, phone, id, lat, lon) 
    //   VALUES (
    //     ${general_category}, ${main_category}, ${parent_organization}, ${listing}, ${service_description},
    //     ${covid_message}, ${street}, ${street2}, ${city}, ${postal_code}, ${website}, ${hours}, ${phone}, ${id})
    //   RETURNING *;`
    // );

    const response = await client.query(INSERT_INTO_PREVIEW_TABLE, [
      general_category, main_category, parent_organization, listing,
      service_description, covid_message, street, street2, city,
      postal_code, website, hours, phone, id, lat, lon, county
    ]);
    if (response) {
      console.log(response.rows[0]);
    }
    // await client.release();
  } catch (error) {
    console.error(error.message)
    return;
  }
}


const promotePreviewToProd = async () => {
  try {
  await pool.query('DROP TABLE IF EXISTS production_data');
  const success = await pool.query(CREATE_PRODUCTION_TABLE);
  console.log(success.rows);
  } catch (error) {
    console.error(error.message)
    return;    
  }
}

const dropAndRecreatePreviewTable = async () => {
  try {
    await pool.query(DROP_PREVIEW_TABLE);
    await pool.query(CREATE_PREVIEW_TABLE);
  } catch (error) {
    console.error(error.message);
    return
  }
}

// dropAndRecreatePreviewTable();


// ONE-TIME-USE GEOCODING STUFF -----------------------
// You only need to run this ONCE to populate the Airtable
const {EXISTING_DATA} = require("../existingData");

async function geocode() {
  try {
    base("CURRENT DATA")
      .select({view: "Clean Data"})
      .all()
      .then((results) => {
        // 1. Filter out fields we don't use in the DB
        results = results.map((result) => {
          let listing = formatListing(result);
          let airtableId = result.id;
          EXISTING_DATA.forEach((obj) => {
            if (listing.street !== null && obj.street === listing.street) {
              updateAirtableLatLon({ lat: obj.lat, lon: obj.lon, id: airtableId,
              });
            }
          });
        });
      })
      .catch((err) => console.error(err));
  } catch (error) {
    console.log(error)
    return
  }
}

// helper functions 
async function updateAirtableLatLon({lat, lon, id}) {
  try {
    lat = parseFloat(lat)
    lon = parseFloat(lon)

      await base("CURRENT DATA").update([
        {
          id: id,
          fields: {
            lat: lat,
            lon: lon,
          },
        },
      ]); 
  } catch (error) {
    console.log(error)
    return;
  }
}
// up to 10 records
// each need "fields" array and "id"
// non destrucitve. only updates fields included; does not change fields not mentioned