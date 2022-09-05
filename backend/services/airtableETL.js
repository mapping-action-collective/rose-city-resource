const Airtable = require("airtable");
require("dotenv").config();
// Airtable API documentation: https://airtable.com/app1aef4m31bbo69J/api/docs#javascript/authentication

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

// This will be triggered by the user
// TODO: Add an element to the UI so the user can trigger this script
async function runAirtableEtl() {
  try {
    base("CURRENT DATA")
      .select({view: "Clean Data"})
      .all()
      .then((results) => {
        // Write results to Postgres
        (async () => {
          const client = await pool.connect();
          try {
            results.forEach((result) => {
              let listing = formatListing(result);
              if (listing.id > 112) {
                (async () => {
                  await writeListingToPreview(listing, client);
                })();
              }
            });
          } catch (error) {
            console.log("error in airtable ETL catch", error.message);
            return;
          }
        })();
      })
      .catch((err) => console.error(err));
  } catch (error) {
    console.log(error);
    return;
  }
}

// Helper formatting functions for Airtable ETL

// The API expects "phone" to be a single string that includes all phone labels and numbers, separated by commas
// Example string: "Main Line:(503)555-5555,Crisis Line:800-424-1325"
const formatPhone = (record) => {
  let phoneString = "";
  if (record.phone_1_label) {
    phoneString += record.phone_1_label + ":";
  }
  if (record.phone_1) {
    phoneString += record.phone_1 + ",";
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
  phoneString = phoneString.slice(0, -1);
  record.phone = phoneString;
  return record;
};

const formatId = (record) => {
  record.id = record.asset_id;
  return record;
};

const DATABASE_FIELDS = [
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
  "phone",
  "asset_id",
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
};


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
`;

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
    const general_category = record.general_category ?? "";
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

    const response = await client.query(INSERT_INTO_PREVIEW_TABLE, [
      general_category,
      main_category,
      parent_organization,
      listing,
      service_description,
      covid_message,
      street,
      street2,
      city,
      postal_code,
      website,
      hours,
      phone,
      id,
      lat,
      lon,
      county,
    ]);
    if (response) {
      console.log(response.rows[0]);
    }
  } catch (error) {
    console.error(error.message);
    return;
  }
};

const promotePreviewToProd = async () => {
  try {
    await pool.query("DROP TABLE IF EXISTS production_data");
    const success = await pool.query(CREATE_PRODUCTION_TABLE);
    console.log(success.rows);
  } catch (error) {
    console.error(error.message);
    return;
  }
};

const dropAndRecreatePreviewTable = async () => {
  try {
    await pool.query(DROP_PREVIEW_TABLE);
    await pool.query(CREATE_PREVIEW_TABLE);
  } catch (error) {
    console.error(error.message);
    return;
  }
};